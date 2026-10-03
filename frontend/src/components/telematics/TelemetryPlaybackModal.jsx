import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, FastForward, RotateCcw, X, Film, Calendar, Clock, Database, Trash2, Cpu } from 'lucide-react';
import LiveCellMatrix from './LiveCellMatrix';

export default function TelemetryPlaybackModal({ isOpen, onClose }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  const timerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchSessions();
    } else {
      stopPlayback();
      setSelectedSession(null);
      setSessionData(null);
    }
  }, [isOpen]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/telematics/sessions');
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error('Failed to fetch telemetry sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionDetails = async (id) => {
    stopPlayback();
    setLoading(true);
    try {
      const res = await fetch(`/api/telematics/sessions/${id}`);
      const data = await res.json();
      if (data.success && data.session) {
        setSelectedSession(data.session);
        setSessionData(data.session.frames || []);
        setCurrentFrameIndex(0);
      }
    } catch (err) {
      console.error('Failed to load session details:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this recorded session stream?')) return;
    try {
      await fetch(`/api/telematics/sessions/${id}`, { method: 'DELETE' });
      if (selectedSession?._id === id) {
        setSelectedSession(null);
        setSessionData(null);
      }
      fetchSessions();
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const startPlayback = () => {
    if (!sessionData || sessionData.length === 0) return;
    setIsPlaying(true);
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (isPlaying && sessionData && sessionData.length > 0) {
      const intervalMs = Math.round(1000 / speedMultiplier);
      timerRef.current = setInterval(() => {
        setCurrentFrameIndex((prevIndex) => {
          if (prevIndex >= sessionData.length - 1) {
            stopPlayback();
            return prevIndex;
          }
          return prevIndex + 1;
        });
      }, intervalMs);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speedMultiplier, sessionData]);

  if (!isOpen) return null;

  const currentFrame = sessionData ? sessionData[currentFrameIndex] : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <Film className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Recorded Telemetry Sessions & Trip Replay
              </h3>
              <p className="text-xs text-slate-400">Select a stored session to replay thermal dynamics frame-by-frame</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sessions Sidebar */}
          <div className="lg:col-span-1 bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              Stored Sessions ({sessions.length})
            </h4>

            {loading && !sessionData && (
              <div className="p-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <Cpu className="w-4 h-4 animate-spin text-purple-400" />
                Loading sessions...
              </div>
            )}

            {!loading && sessions.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-500">
                No recorded sessions found in database. Start a recording from the Telematics Control Panel!
              </div>
            )}

            <div className="space-y-2 overflow-y-auto max-h-[50vh] pr-1">
              {sessions.map((sess) => {
                const isSelected = selectedSession?._id === sess._id;
                return (
                  <div
                    key={sess._id}
                    onClick={() => loadSessionDetails(sess._id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-purple-950/60 border-purple-600 text-white shadow-lg'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="font-bold text-slate-200 truncate">{sess.sessionName}</div>
                      <button
                        onClick={(e) => deleteSession(sess._id, e)}
                        className="text-slate-600 hover:text-emerald-400 p-1 rounded transition-colors"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-purple-400" />
                        {sess.durationSec}s ({sess.frameCount} frames)
                      </span>
                      <span className="bg-slate-950 px-2 py-0.5 rounded text-purple-300 border border-slate-800">
                        {sess.driveMode}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800/60">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {new Date(sess.createdAt).toLocaleDateString()}
                      </span>
                      <span>Max ΔV: {sess.maxDeltaV}V</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Replay Viewer */}
          <div className="lg:col-span-2 flex flex-col space-y-4">
            {!selectedSession ? (
              <div className="flex-1 min-h-[300px] bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500 text-xs text-center p-6">
                Select a recorded session from the left sidebar to start replay simulation.
              </div>
            ) : (
              <>
                {/* Frame Stats Header */}
                {currentFrame && (
                  <div className="grid grid-cols-4 gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Frame</span>
                      <span className="font-bold text-white">
                        {currentFrameIndex + 1} / {sessionData.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Pack Temp</span>
                      <span className="font-bold text-emerald-400">{currentFrame.packTemp}°C</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Pack Current</span>
                      <span className="font-bold text-cyan-400">{currentFrame.current} A</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Cell Delta V</span>
                      <span className="font-bold text-amber-400">{currentFrame.deltaV} V</span>
                    </div>
                  </div>
                )}

                {/* Live Matrix Replay */}
                {currentFrame && (
                  <LiveCellMatrix
                    cellVoltages={currentFrame.cellVoltages}
                    hotspotCellIndex={currentFrame.hotspotCellIndex}
                    deltaV={currentFrame.deltaV}
                  />
                )}

                {/* Scrubber & Controls */}
                <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 flex flex-col space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400">00:00</span>
                    <input
                      type="range"
                      min="0"
                      max={sessionData.length - 1}
                      value={currentFrameIndex}
                      onChange={(e) => setCurrentFrameIndex(Number(e.target.value))}
                      className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <span className="text-xs font-mono text-slate-400">
                      {Math.floor(sessionData.length * 2)}s
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentFrameIndex(0)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                        title="Reset to frame 1"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      {isPlaying ? (
                        <button
                          onClick={stopPlayback}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5"
                        >
                          <Pause className="w-4 h-4 fill-white" />
                          Pause
                        </button>
                      ) : (
                        <button
                          onClick={startPlayback}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          Replay Session
                        </button>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
                      <span className="text-slate-500 text-[10px] px-1.5">Speed:</span>
                      {[1, 2, 4].map((multiplier) => (
                        <button
                          key={multiplier}
                          onClick={() => setSpeedMultiplier(multiplier)}
                          className={`px-2 py-0.5 rounded text-xs transition-colors ${
                            speedMultiplier === multiplier
                              ? 'bg-purple-600 text-white font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {multiplier}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
