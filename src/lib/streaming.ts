import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';
const TOKEN_EXPIRATION = parseInt(process.env.JWT_EXPIRATION || '3600');

export interface StreamTokenPayload {
  userId: string;
  episodeId: string;
  quality: string;
  tokenId: string;
  exp: number;
}

export async function generateStreamToken(
  userId: string,
  episodeId: string,
  quality: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const tokenId = uuidv4();
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION * 1000);

  // Store token in database
  await prisma.streamToken.create({
    data: {
      id: tokenId,
      userId,
      episodeId,
      token: tokenId,
      quality,
      ipAddress,
      userAgent,
      expiresAt,
    },
  });

  // Create JWT token
  const token = jwt.sign(
    {
      userId,
      episodeId,
      quality,
      tokenId,
    },
    JWT_SECRET,
    {
      expiresIn: TOKEN_EXPIRATION,
    }
  );

  return token;
}

export async function verifyStreamToken(token: string): Promise<StreamTokenPayload | null> {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as StreamTokenPayload;

    // Check if token exists in database and is not expired
    const dbToken = await prisma.streamToken.findUnique({
      where: { id: payload.tokenId },
    });

    if (!dbToken || dbToken.expiresAt < new Date()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function revokeStreamToken(tokenId: string): Promise<void> {
  await prisma.streamToken.delete({
    where: { id: tokenId },
  });
}

export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.streamToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
  return result.count;
}

export async function getActiveStreamCount(userId: string): Promise<number> {
  return prisma.streamToken.count({
    where: {
      userId,
      expiresAt: {
        gt: new Date(),
      },
    },
  });
}

export async function generateDownloadToken(
  userId: string,
  episodeId: string,
  quality: string
): Promise<string> {
  const tokenId = uuidv4();
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

  await prisma.download.create({
    data: {
      userId,
      episodeId,
      quality,
      token: tokenId,
      expiresAt,
    },
  });

  return tokenId;
}

export async function verifyDownloadToken(token: string): Promise<{
  userId: string;
  episodeId: string;
  quality: string;
} | null> {
  const download = await prisma.download.findUnique({
    where: { token },
  });

  if (!download || download.expiresAt < new Date() || download.downloadedAt) {
    return null;
  }

  return {
    userId: download.userId,
    episodeId: download.episodeId,
    quality: download.quality,
  };
}

export async function markDownloadComplete(token: string): Promise<void> {
  await prisma.download.update({
    where: { token },
    data: { downloadedAt: new Date() },
  });
}

export function generateHLSManifestUrl(episodeId: string, quality: string, token: string): string {
  const baseUrl = process.env.CDN_URL || process.env.NEXT_PUBLIC_APP_URL || '';
  return `${baseUrl}/api/stream/${episodeId}/${quality}/manifest.m3u8?token=${token}`;
}

export function generateVLCUrl(episodeId: string, quality: string, token: string): string {
  const manifestUrl = generateHLSManifestUrl(episodeId, quality, token);
  return `vlc://${manifestUrl}`;
}

export function getQualityFilePath(
  episode: { filePath1080p?: string | null; filePath4K?: string | null; filePath4K240?: string | null },
  quality: string
): string | null {
  switch (quality) {
    case '4K240':
      return episode.filePath4K240 || null;
    case '4K':
      return episode.filePath4K || null;
    case '1080p':
    default:
      return episode.filePath1080p || null;
  }
}
