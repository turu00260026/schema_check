import React, { useState, useEffect } from 'react';
import { loadAllGrades } from './utils/gradeLoader';
import { storage } from './utils/storage';
import { QuizFlow } from './components/QuizFlow';
import { ResultScreen } from './components/ResultScreen';
import { ParentDashboard } from './components/ParentDashboard';
import { PinEntry } from './components/PinEntry';
import type { GradeData, QuestionResult } from './types';

type Screen =
  | 'home'
  | 'name-setup'
  | 'grade-select'
  | 'quiz'
  | 'result'
  | 'pin-set'
  | 'pin-verify'
  | 'parent-dashboard';

export default function App() {
  const grades = loadAllGrades();
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedGrade, setSelectedGrade] = useState<GradeData | null>(null);
  const [quizResults, setQuizResults] = useState<QuestionResult[]>([]);
  const [childName, setChildName] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    const stored = storage.get();
    if (stored.childName) setChildName(stored.childName);
  }, []);

  const handleStartQuiz = (grade: GradeData) => {
    setSelectedGrade(grade);
    setScreen('quiz');
  };

  const handleQuizComplete = (results: QuestionResult[]) => {
    setQuizResults(results);
    setScreen('result');
  };

  const handleRetry = () => {
    setScreen('quiz');
  };

  const handleHome = () => {
    setSelectedGrade(null);
    setScreen('home');
  };

  const handleParentAccess = () => {
    if (storage.hasPin()) {
      setPinError('');
      setScreen('pin-verify');
    } else {
      setScreen('pin-set');
    }
  };

  const handlePinSet = (pin: string) => {
    storage.setPin(pin);
    setScreen('parent-dashboard');
  };

  const handlePinVerify = (pin: string) => {
    if (storage.verifyPin(pin)) {
      setPinError('');
      setScreen('parent-dashboard');
    } else {
      setPinError('あんしょうばんごうが ちがいます');
      setTimeout(() => setPinError(''), 2000);
    }
  };

  const handleNameSave = () => {
    const n = nameInput.trim();
    if (!n) return;
    storage.setChildName(n);
    setChildName(n);
    setScreen('home');
  };

  // ── Screens ──────────────────────────────────────────────

  if (screen === 'name-setup') {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 12 }}>✏️</div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#1a237e',
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            なまえを おしえてね！
          </div>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
            placeholder="なまえ"
            style={{
              width: '100%',
              padding: '14px 18px',
              fontSize: 26,
              borderRadius: 14,
              border: '3px solid #90caf9',
              marginBottom: 20,
              boxSizing: 'border-box',
              textAlign: 'center',
            }}
            autoFocus
          />
          <button
            onClick={handleNameSave}
            disabled={!nameInput.trim()}
            style={{
              ...primaryBtn,
              width: '100%',
              opacity: nameInput.trim() ? 1 : 0.5,
            }}
          >
            けってい！
          </button>
          <button
            onClick={() => setScreen('home')}
            style={{ ...ghostBtn, width: '100%', marginTop: 12 }}
          >
            スキップ
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'pin-set') {
    return (
      <div style={pageStyle}>
        <div style={{ padding: 24 }}>
          <PinEntry
            mode="set"
            onSuccess={handlePinSet}
            onCancel={() => setScreen('home')}
          />
        </div>
      </div>
    );
  }

  if (screen === 'pin-verify') {
    return (
      <div style={pageStyle}>
        <div style={{ padding: 24 }}>
          {pinError && (
            <div
              style={{
                background: '#ffebee',
                color: '#c62828',
                padding: '12px 24px',
                borderRadius: 12,
                fontSize: 20,
                fontWeight: 'bold',
                marginBottom: 16,
                textAlign: 'center',
              }}
            >
              {pinError}
            </div>
          )}
          <PinEntry
            mode="verify"
            onSuccess={handlePinVerify}
            onCancel={() => setScreen('home')}
          />
        </div>
      </div>
    );
  }

  if (screen === 'parent-dashboard') {
    return (
      <div style={{ ...pageStyle, paddingTop: 0 }}>
        <ParentDashboard onClose={handleHome} />
      </div>
    );
  }

  if (screen === 'quiz' && selectedGrade) {
    return (
      <div style={pageStyle}>
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            background: '#1565c0',
            borderRadius: '0 0 20px 20px',
            marginBottom: 20,
            color: '#fff',
          }}
        >
          <button
            onClick={handleHome}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              fontSize: 18,
              padding: '8px 16px',
              borderRadius: 20,
              cursor: 'pointer',
            }}
          >
            ← ホーム
          </button>
          <span style={{ fontWeight: 'bold', fontSize: 20 }}>
            {selectedGrade.label} さんすうスキーマ
          </span>
          <span style={{ fontSize: 18 }}>🧠</span>
        </div>
        <QuizFlow
          questions={selectedGrade.questions}
          onComplete={handleQuizComplete}
        />
      </div>
    );
  }

  if (screen === 'result' && selectedGrade) {
    return (
      <div style={pageStyle}>
        <ResultScreen
          results={quizResults}
          grade={selectedGrade.grade}
          onRetry={handleRetry}
          onHome={handleHome}
        />
      </div>
    );
  }

  // ── Home screen ───────────────────────────────────────────
  return (
    <div style={pageStyle}>
      {/* Hero */}
      <div
        style={{
          textAlign: 'center',
          padding: '32px 16px 24px',
          background: 'linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)',
          borderRadius: '0 0 40px 40px',
          marginBottom: 28,
          color: '#fff',
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 8 }}>🧮</div>
        <div style={{ fontSize: 28, fontWeight: 'bold', lineHeight: 1.3, marginBottom: 6 }}>
          さんすう スキーマ しんだん
        </div>
        <div style={{ fontSize: 18, opacity: 0.9 }}>
          もんだいの ようすを よみとろう！
        </div>
        {childName && (
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.25)',
              borderRadius: 30,
              padding: '6px 20px',
              fontSize: 20,
              marginTop: 12,
              fontWeight: 'bold',
            }}
          >
            👋 {childName} さん、こんにちは！
          </div>
        )}
      </div>

      {/* Grade buttons */}
      <div style={{ padding: '0 16px' }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 'bold',
            color: '#333',
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          がくねんを えらんでね
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 32,
          }}
        >
          {grades.map((grade) => (
            <button
              key={grade.grade}
              onClick={() => handleStartQuiz(grade)}
              style={{
                padding: '28px 16px',
                fontSize: 26,
                fontWeight: 'bold',
                borderRadius: 24,
                border: 'none',
                background: gradeButtonGradient(grade.grade),
                color: '#fff',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  '0 10px 28px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  '0 6px 20px rgba(0,0,0,0.15)';
              }}
            >
              <span style={{ fontSize: 40 }}>{gradeEmoji(grade.grade)}</span>
              <span>{grade.label}</span>
              <span style={{ fontSize: 15, opacity: 0.85 }}>
                {grade.questions.length} もんだい
              </span>
            </button>
          ))}
        </div>

        {/* Bottom actions */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
            paddingBottom: 32,
          }}
        >
          <button onClick={() => setScreen('name-setup')} style={ghostBtn}>
            ✏️ {childName ? 'なまえを かえる' : 'なまえを いれる'}
          </button>
          <button onClick={handleParentAccess} style={parentBtn}>
            👪 おや用 ページ
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Styles & helpers ─────────────────────────────────────────
const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#f0f4ff',
  fontFamily: '"Hiragino Kaku Gothic Pro", "Meiryo", "Yu Gothic", sans-serif',
};

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 24,
  padding: 32,
  maxWidth: 400,
  margin: '40px auto',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
};

const primaryBtn: React.CSSProperties = {
  padding: '16px 40px',
  fontSize: 22,
  fontWeight: 'bold',
  borderRadius: 40,
  border: 'none',
  background: 'linear-gradient(135deg, #42a5f5, #1565c0)',
  color: '#fff',
  cursor: 'pointer',
  boxShadow: '0 4px 16px rgba(21,101,192,0.4)',
};

const ghostBtn: React.CSSProperties = {
  padding: '14px 28px',
  fontSize: 18,
  fontWeight: 'bold',
  borderRadius: 40,
  border: '2px solid #90caf9',
  background: '#fff',
  color: '#1565c0',
  cursor: 'pointer',
};

const parentBtn: React.CSSProperties = {
  padding: '14px 28px',
  fontSize: 18,
  fontWeight: 'bold',
  borderRadius: 40,
  border: '2px solid #ab47bc',
  background: '#f3e5f5',
  color: '#6a1b9a',
  cursor: 'pointer',
};

function gradeButtonGradient(grade: number): string {
  const gradients: Record<number, string> = {
    1: 'linear-gradient(135deg, #ff8a65, #e64a19)',
    2: 'linear-gradient(135deg, #66bb6a, #2e7d32)',
    3: 'linear-gradient(135deg, #42a5f5, #1565c0)',
    4: 'linear-gradient(135deg, #ab47bc, #6a1b9a)',
    5: 'linear-gradient(135deg, #ffa726, #e65100)',
    6: 'linear-gradient(135deg, #26a69a, #00695c)',
  };
  return gradients[grade] ?? 'linear-gradient(135deg, #78909c, #37474f)';
}

function gradeEmoji(grade: number): string {
  const emojis: Record<number, string> = {
    1: '🌱',
    2: '🌿',
    3: '🌳',
    4: '⭐',
    5: '🚀',
    6: '🏆',
  };
  return emojis[grade] ?? '📚';
}
