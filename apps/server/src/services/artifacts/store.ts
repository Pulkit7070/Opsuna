import { supabaseAdmin } from '../../lib/supabase';
import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';

const BUCKET_NAME = 'execution-artifacts';

export type ArtifactType = 'log_bundle' | 'report' | 'file' | 'data';

export interface ArtifactInput {
  executionId: string;
  type: ArtifactType;
  name: string;
  content: string | Buffer;
  mimeType?: string;
  metadata?: Record<string, unknown>;
}

export interface ArtifactRecord {
  id: string;
  executionId: string;
  type: string;
  name: string;
  mimeType: string;
  size: number;
  storagePath: string;
  publicUrl: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

/**
 * Upload an artifact to Supabase Storage and create a database record.
 */
export async function uploadArtifact(input: ArtifactInput): Promise<ArtifactRecord | null> {
  const { executionId, type, name, content, mimeType = 'application/octet-stream', metadata } = input;

  // Convert content to Buffer if string
  const buffer = typeof content === 'string' ? Buffer.from(content, 'utf-8') : content;
  const size = buffer.length;

  // Generate storage path
  const timestamp = Date.now();
  const storagePath = `${executionId}/${timestamp}-${name}`;

  // Upload to Supabase Storage if available
  let publicUrl: string | null = null;

  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(storagePath, buffer, {
          contentType: mimeType,
          upsert: false,
        });

      if (error) {
        console.error('[Artifacts] Upload failed:', error);
        // Continue without storage - will store path for later upload
      } else if (data) {
        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
          .from(BUCKET_NAME)
          .getPublicUrl(storagePath);
        publicUrl = urlData?.publicUrl || null;
      }
    } catch (error) {
      console.error('[Artifacts] Storage error:', error);
    }
  }

  // Create database record
  try {
    const artifact = await prisma.artifact.create({
      data: {
        executionId,
        type,
        name,
        mimeType,
        size,
        storagePath,
        publicUrl,
        metadata: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
      },
    });

    return artifact as ArtifactRecord;
  } catch (error) {
    console.error('[Artifacts] Database error:', error);
    return null;
  }
}

/**
 * Get all artifacts for an execution.
 */
export async function getExecutionArtifacts(executionId: string): Promise<ArtifactRecord[]> {
  const artifacts = await prisma.artifact.findMany({
    where: { executionId },
    orderBy: { createdAt: 'desc' },
  });

  return artifacts as ArtifactRecord[];
}

/**
 * Get a single artifact by ID.
 */
export async function getArtifact(id: string): Promise<ArtifactRecord | null> {
  const artifact = await prisma.artifact.findUnique({
    where: { id },
  });

  return artifact as ArtifactRecord | null;
}

/**
 * Download artifact content from storage.
 */
export async function downloadArtifact(storagePath: string): Promise<Buffer | null> {
  if (!supabaseAdmin) {
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .download(storagePath);

    if (error || !data) {
      console.error('[Artifacts] Download failed:', error);
      return null;
    }

    // Convert Blob to Buffer
    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('[Artifacts] Download error:', error);
    return null;
  }
}

/**
 * Delete an artifact from storage and database.
 */
export async function deleteArtifact(id: string): Promise<boolean> {
  try {
    const artifact = await prisma.artifact.findUnique({
      where: { id },
    });

    if (!artifact) {
      return false;
    }

    // Delete from storage
    if (supabaseAdmin) {
      await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .remove([artifact.storagePath]);
    }

    // Delete from database
    await prisma.artifact.delete({
      where: { id },
    });

    return true;
  } catch (error) {
    console.error('[Artifacts] Delete error:', error);
    return false;
  }
}

/**
 * Create a log bundle artifact from execution logs.
 */
export async function createLogBundle(
  executionId: string,
  logs: Array<{ timestamp: Date; level: string; message: string }>
): Promise<ArtifactRecord | null> {
  const logContent = logs
    .map((log) => `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] ${log.message}`)
    .join('\n');

  return uploadArtifact({
    executionId,
    type: 'log_bundle',
    name: `logs-${executionId.slice(0, 8)}.txt`,
    content: logContent,
    mimeType: 'text/plain',
    metadata: { logCount: logs.length },
  });
}

/**
 * Get the storage bucket name.
 */
export function getBucketName(): string {
  return BUCKET_NAME;
}
