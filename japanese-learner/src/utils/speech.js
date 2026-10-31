import { useSyncExternalStore } from 'react';

let cachedVoices = [];
let isSpeakingState = false;
let activeSessionId = 0;
let activeUtterances = [];
const listeners = new Set();

function loadVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  cachedVoices = window.speechSynthesis.getVoices();
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;

  window.addEventListener('beforeunload', () => {
    stopSpeaking();
  });
}

function notify(speaking) {
  if (isSpeakingState !== speaking) {
    isSpeakingState = speaking;
    listeners.forEach((fn) => {
      try {
        fn(isSpeakingState);
      } catch {
        // ignore subscriber errors
      }
    });
  }
}

export function subscribeSpeaking(callback) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function isSpeaking() {
  return isSpeakingState;
}

export function useSpeaking() {
  return useSyncExternalStore(
    subscribeSpeaking,
    isSpeaking,
    () => false
  );
}

function getJapaneseVoice() {
  const voices = cachedVoices.length ? cachedVoices : window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === 'ja-JP') ||
    voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('ja'))
  );
}

function createUtterance(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.9;
  const voice = getJapaneseVoice();
  if (voice) {
    utterance.voice = voice;
  }
  return utterance;
}

export function stopSpeaking() {
  activeSessionId++;
  activeUtterances = [];
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore cancel errors
    }
  }
  notify(false);
}

export function speakJapaneseList(texts) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  const list = texts.filter(Boolean);
  if (!list.length) {
    stopSpeaking();
    return false;
  }

  stopSpeaking();

  const sessionId = ++activeSessionId;
  notify(true);

  const synth = window.speechSynthesis;
  const utterances = list.map((text, index) => {
    const utter = createUtterance(text);
    const isLast = index === list.length - 1;

    utter.onstart = () => {
      if (sessionId === activeSessionId) {
        notify(true);
      }
    };

    utter.onend = () => {
      if (sessionId === activeSessionId && isLast) {
        activeUtterances = [];
        notify(false);
      }
    };

    utter.onerror = (e) => {
      if (sessionId === activeSessionId) {
        if (isLast || e.error === 'canceled' || e.error === 'interrupted') {
          activeUtterances = [];
          notify(false);
        }
      }
    };

    return utter;
  });

  // Retain reference to prevent garbage collection in Chromium
  activeUtterances = utterances;
  utterances.forEach((u) => synth.speak(u));
  return true;
}

export function speakJapanese(text) {
  if (!text) return false;
  return speakJapaneseList([text]);
}
