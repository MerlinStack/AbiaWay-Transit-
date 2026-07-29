export type TransportMode = 'WEBSOCKET' | 'SSE' | 'LONG_POLL' | 'DISCONNECTED';
export interface TelemetryPacket {
  plate: string;
  lat: number;
  lng: number;
  soc: number;
  timestamp: number;
}
export interface SyncEngineConfig {
  wsUrl: string;
  sseUrl: string;
  pollUrl: string;
  pollIntervalMs: number;
  maxRetries: number;
}

export class TelemetrySyncEngine {
  private config: SyncEngineConfig;
  private mode: TransportMode = 'DISCONNECTED';
  private socket: WebSocket | null = null;
  private eventSource: EventSource | null = null;
  private pollIntervalId: ReturnType<typeof setInterval> | null = null;
  private retryCount = 0;
  private onMessageCallback: (data: TelemetryPacket) => void;
  private onModeChangeCallback: (mode: TransportMode) => void;

  constructor(
    config: SyncEngineConfig,
    onMessage: (data: TelemetryPacket) => void,
    onModeChange: (mode: TransportMode) => void,
  ) {
    this.config = config;
    this.onMessageCallback = onMessage;
    this.onModeChangeCallback = onModeChange;
  }

  public connect(): void {
    this.attemptWebSocket();
  }

  public getMode(): TransportMode {
    return this.mode;
  }

  private setMode(newMode: TransportMode): void {
    if (this.mode !== newMode) {
      this.mode = newMode;
      this.onModeChangeCallback(newMode);
    }
  }

  private attemptWebSocket(): void {
    this.cleanup();
    this.setMode('DISCONNECTED');

    try {
      this.socket = new WebSocket(this.config.wsUrl);

      this.socket.onopen = () => {
        this.setMode('WEBSOCKET');
        this.retryCount = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const packet: TelemetryPacket = JSON.parse(event.data);
          this.onMessageCallback(packet);
        } catch { /* malformed */ }
      };

      this.socket.onerror = () => this.handleFailure();
      this.socket.onclose = () => {
        if (this.mode === 'WEBSOCKET') this.handleFailure();
      };
    } catch {
      this.handleFailure();
    }
  }

  private attemptSSE(): void {
    this.cleanup();
    try {
      this.eventSource = new EventSource(this.config.sseUrl);
      this.eventSource.onopen = () => {
        this.setMode('SSE');
        this.retryCount = 0;
      };
      this.eventSource.onmessage = (event) => {
        try {
          const packet: TelemetryPacket = JSON.parse(event.data);
          this.onMessageCallback(packet);
        } catch { /* malformed */ }
      };
      this.eventSource.onerror = () => this.handleFailure();
    } catch {
      this.handleFailure();
    }
  }

  private startLongPolling(): void {
    this.cleanup();
    this.setMode('LONG_POLL');
    this.retryCount = 0;

    const executePoll = async () => {
      try {
        const response = await fetch(this.config.pollUrl);
        if (!response.ok) throw new Error('Poll failed');
        const packets: TelemetryPacket[] = await response.json();
        packets.forEach((p) => this.onMessageCallback(p));
      } catch { /* poll dropped */ }
    };

    executePoll();
    this.pollIntervalId = setInterval(executePoll, this.config.pollIntervalMs);
  }

  private handleFailure(): void {
    this.retryCount++;
    if (this.mode === 'DISCONNECTED' && this.retryCount <= this.config.maxRetries) {
      const backoff = Math.pow(2, this.retryCount) * 1000;
      setTimeout(() => this.attemptWebSocket(), backoff);
    } else if (this.mode === 'DISCONNECTED' || this.mode === 'WEBSOCKET') {
      this.attemptSSE();
    } else if (this.mode === 'SSE') {
      this.startLongPolling();
    }
  }

  public cleanup(): void {
    if (this.socket) { this.socket.close(); this.socket = null; }
    if (this.eventSource) { this.eventSource.close(); this.eventSource = null; }
    if (this.pollIntervalId) { clearInterval(this.pollIntervalId); this.pollIntervalId = null; }
  }
}
