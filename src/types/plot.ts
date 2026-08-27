/**
 * Plot Data Types for Master Layout 3D Application
 * Clean Minimal Preparation for Supabase Backend Integration
 */

export type PlotStatus = 'available' | 'sold';

export interface PlotBackendData {
  id: number;
  plotNumber: string;
  status: PlotStatus;
}

export type PlotStatusMap = Record<number, PlotStatus>;
