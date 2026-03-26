import type { TurnAction } from '@shared/types/game';

export interface RecordedAction {
  readonly action: TurnAction;
  readonly timestamp: number;
  readonly turnNumber: number;
  readonly roundNumber: number;
}

/**
 * Records player actions for replay.
 */
export class ActionRecorder {
  private readonly actions: RecordedAction[] = [];
  private _recording = false;

  get isRecording(): boolean {
    return this._recording;
  }
  get actionCount(): number {
    return this.actions.length;
  }

  startRecording(): void {
    this._recording = true;
  }
  stopRecording(): void {
    this._recording = false;
  }

  record(action: TurnAction, turnNumber: number, roundNumber: number): void {
    if (!this._recording) return;
    this.actions.push({ action, timestamp: performance.now(), turnNumber, roundNumber });
  }

  getActions(): readonly RecordedAction[] {
    return [...this.actions];
  }

  getActionsForRound(roundNumber: number): readonly RecordedAction[] {
    return this.actions.filter((a) => a.roundNumber === roundNumber);
  }

  getActionsForTurn(turnNumber: number): readonly RecordedAction[] {
    return this.actions.filter((a) => a.turnNumber === turnNumber);
  }

  clear(): void {
    this.actions.length = 0;
  }
}
