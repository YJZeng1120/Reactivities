import React, { useEffect, useReducer, useRef } from "react";

// WebSocket 狀態管理
interface State {
  connected: boolean;
  prices: { time: string; price: number }[];
}

type Action =
  | { type: "CONNECT" }
  | { type: "DISCONNECT" }
  | { type: "ADD_PRICE"; payload: { time: string; price: number } };

const initialState: State = {
  connected: false,
  prices: []
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "CONNECT":
      return { ...state, connected: true };
    case "DISCONNECT":
      return { ...state, connected: false };
    case "ADD_PRICE": {
      const updated = [action.payload, ...state.prices];
      return { ...state, prices: updated.slice(0, 20) };
    }
    default:
      return state;
  }
}

export default function WebSocketDemo() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number | null>(null);

  const connectWebSocket = () => {
    const socket = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
      dispatch({ type: "CONNECT" });
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const price = parseFloat(data.p);
      const now = new Date().toLocaleTimeString();
      dispatch({ type: "ADD_PRICE", payload: { time: now, price } });
    };

    socket.onclose = () => {
      console.log("❌ WebSocket closed. Reconnecting...");
      dispatch({ type: "DISCONNECT" });
      // 重連機制：3 秒後重連
      reconnectRef.current = setTimeout(connectWebSocket, 3000);
    };

    socket.onerror = (error) => {
      console.error("⚠️ WebSocket error:", error);
    };
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      socketRef.current?.close();
    };
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>📡 BTC/USDT 即時成交價格（{state.connected ? "🟢 已連線" : "🔴 已斷線"}）</h2>

      <div style={{ marginTop: 20 }}>
        <strong>最新 20 筆成交價：</strong>
        <ul>
          {[...state.prices].map((p, i) => (
            <li key={i}>
              {p.time} - ${p.price}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
