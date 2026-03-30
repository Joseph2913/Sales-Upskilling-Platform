import { supabase, isSupabaseConfigured } from './supabase';
import type { SimulationState } from '../constants/elearningContent';

/**
 * Save simulation state to Supabase topic_progress.simulation_state.
 * Requires the simulation_state jsonb column (see migration in PRD §0.2).
 */
export async function saveSimulationState(
  userId: string,
  objectiveId: number,
  state: SimulationState
): Promise<void> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured — simulation state not persisted');
    return;
  }

  try {
    const { error } = await supabase
      .from('topic_progress')
      .upsert(
        {
          user_id: userId,
          level: 1,
          topic_id: objectiveId,
          simulation_state: state,
        },
        { onConflict: 'user_id,level,topic_id' }
      );
    if (error) {
      console.error('saveSimulationState error:', error);
    }
  } catch (err) {
    console.error('saveSimulationState error:', err);
  }
}

/**
 * Mark simulation as completed by setting simulation_completed_at.
 */
export async function completeSimulation(
  userId: string,
  objectiveId: number
): Promise<void> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured — simulation completion not recorded');
    return;
  }

  try {
    const { error } = await supabase
      .from('topic_progress')
      .upsert(
        {
          user_id: userId,
          level: 1,
          topic_id: objectiveId,
          simulation_completed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,level,topic_id' }
      );
    if (error) {
      console.error('completeSimulation error:', error);
    }
  } catch (err) {
    console.error('completeSimulation error:', err);
  }
}

/**
 * Load saved simulation state for resume functionality.
 */
export async function getSimulationState(
  userId: string,
  objectiveId: number
): Promise<SimulationState | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from('topic_progress')
      .select('simulation_state')
      .eq('user_id', userId)
      .eq('level', 1)
      .eq('topic_id', objectiveId)
      .single();
    if (error || !data?.simulation_state) return null;
    return data.simulation_state as SimulationState;
  } catch {
    return null;
  }
}
