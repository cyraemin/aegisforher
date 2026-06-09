import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const questions = [
  { id: 'q1',  text: "Do you feel safe navigating alone after 8 PM?",          options: ["Safe & calm", "Vigilant", "Unsafe"] },
  { id: 'q2',  text: "Do you share your live location when in a cab?",           options: ["Always", "Sometimes", "Never"] },
  { id: 'q3',  text: "Do you feel your neighborhood is safe in an emergency?",   options: ["Yes", "Maybe", "No"] },
  { id: 'q4',  text: "Do you carry any safety tools (pepper spray, etc.)?",      options: ["Yes", "Sometimes", "Never"] },
  { id: 'q5',  text: "Do you fake calls to feel safer in transit?",              options: ["Often", "Rarely", "Never"] },
  { id: 'q6',  text: "Do you trust official cyber-crime portals?",               options: ["Yes", "Unsure", "No"] },
  { id: 'q7',  text: "Is awareness about digital safety enough in schools?",     options: ["Yes", "Needs work", "None"] },
  { id: 'q8',  text: "Have you ever faced online harassment?",                   options: ["Yes", "No"] },
  { id: 'q9',  text: "Does fear of judgment stop you from reporting?",           options: ["Often", "Sometimes", "Never"] },
  { id: 'q10', text: "Would a unified safety app help you feel secure?",         options: ["Yes", "Maybe", "No"] },
  { id: 'q11', text: "How often do you audit your social media privacy?",        options: ["Weekly", "Monthly", "Rarely"] },
  { id: 'q12', text: "Do you trust law enforcement with digital evidence?",      options: ["Fully", "Neutral", "Distrust"] },
  { id: 'q13', text: "Does seeing safety news increase your anxiety?",           options: ["Yes", "Sometimes", "No"] },
  { id: 'q14', text: "Have you blocked someone for persistent creepy behavior?", options: ["Yes", "No"] },
  { id: 'q15', text: "Do you feel platforms provide adequate safety features?",  options: ["Yes", "Somewhat", "No"] },
];

const COLORS = ['#7a2e20', '#b05a40', '#c4714e', '#d9967e', '#edcabc'];

export default function App() {
  const [step, setStep]           = useState(0);
  const [formData, setFormData]   = useState({});
  const [suggestions, setSuggestions] = useState('');
  const [isAdmin, setIsAdmin]     = useState(false);
  const [liveStats, setLiveStats] = useState({});
  const [user, setUser]           = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.email === 'tamsilsamira@gmail.com') {
      const fetchStats = async () => {
        const { data: records } = await supabase.from('survey_responses').select('*');
        const stats = {};
        questions.forEach(q => {
          stats[q.id] = {};
          q.options.forEach(opt => stats[q.id][opt] = 0);
        });
        records?.forEach(row => {
          questions.forEach(q => {
            if (row[q.id] && stats[q.id].hasOwnProperty(row[q.id])) stats[q.id][row[q.id]] += 1;
          });
        });
        setLiveStats(stats);
      };
      fetchStats();
    }
  }, [isAdmin, user]);

  const loginAsAdmin = async () => {
    const email    = prompt("Enter your admin email:");
    const password = prompt("Enter your admin password:");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else window.location.reload();
  };

  const submitFinal = async () => {
    await supabase.from('survey_responses').insert([formData]);
    if (suggestions.trim()) await supabase.from('text_suggestions').insert([{ suggestion: suggestions }]);
    alert("Contribution recorded. Thank you!");
    window.location.reload();
  };

  const currentQ  = questions[step];
  const isAnswered = currentQ && formData[currentQ.id];

  return (
    <div style={{ minHeight: '100vh', background: '#fdf8f2', fontFamily: "'DM Sans', system-ui, sans-serif", color: '#3a1e0e' }}>

      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        * { box-sizing: border-box; }
        button:focus-visible { outline: 2px solid #b05a40; outline-offset: 3px; }
        textarea:focus { outline: 1.5px solid #b05a40; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '28px 36px', maxWidth: 1040, margin: '0 auto' }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 26, fontWeight: 300, color: '#c4714e', letterSpacing: '0.08em', margin: 0 }}>
            AEGIS FOR HER
          </h1>
          <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#b89080', margin: '4px 0 0' }}>
            Global Safety Research Project
          </p>
        </div>

        {/* Login / Admin toggle — same logic as original */}
        {user ? (
          user.email === 'tamsilsamira@gmail.com' ? (
            <button
              onClick={() => setIsAdmin(!isAdmin)}
              style={{
                background: isAdmin ? 'transparent' : 'linear-gradient(135deg, #7a2e20, #c4714e)',
                color: isAdmin ? '#b05a40' : '#fff',
                border: isAdmin ? '1.5px solid #e8d0c4' : 'none',
                padding: '10px 24px', borderRadius: 100,
                fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
                letterSpacing: '0.05em', cursor: 'pointer',
              }}
            >
              {isAdmin ? '← Back to Survey' : 'Admin Dashboard'}
            </button>
          ) : null
        ) : (
          <button
            onClick={loginAsAdmin}
            style={{
              background: 'transparent', color: '#b89080',
              border: '1.5px solid #e8d0c4',
              padding: '10px 24px', borderRadius: 100,
              fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer',
            }}
          >
            Login
          </button>
        )}
      </div>

      {/* ── Survey ── */}
      {!isAdmin ? (
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '8px 20px 80px' }}>
          <div style={{
            background: '#fff',
            border: '1.5px solid #e8d0c4',
            borderRadius: 28,
            padding: '44px 46px',
            boxShadow: '0 8px 48px rgba(58,30,14,0.07)',
          }}>
            {step < questions.length ? (
              <>
                {/* Progress bar */}
                <div style={{ height: 2, background: '#f2e2da', borderRadius: 99, marginBottom: 32 }}>
                  <div style={{
                    height: '100%',
                    width: `${(step / questions.length) * 100}%`,
                    background: 'linear-gradient(90deg, #7a2e20, #c4714e)',
                    borderRadius: 99,
                    transition: 'width 0.35s ease',
                  }} />
                </div>

                <p style={{ fontSize: 10, color: '#b89080', fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 14 }}>
                  Question {step + 1} of 15
                </p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 26, fontWeight: 300, lineHeight: 1.38, marginBottom: 28, color: '#3a1e0e' }}>
                  {currentQ.text}
                </h2>

                {currentQ.options.map(opt => {
                  const selected = formData[currentQ.id] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setFormData({ ...formData, [currentQ.id]: opt })}
                      style={{
                        display: 'block', width: '100%', padding: '13px 18px', marginBottom: 10,
                        borderRadius: 14, textAlign: 'left', cursor: 'pointer',
                        border: `1.5px solid ${selected ? '#b05a40' : '#e8d0c4'}`,
                        background: selected ? 'rgba(176,90,64,0.09)' : '#fff',
                        color: selected ? '#7a2e20' : '#8a6050',
                        fontFamily: 'inherit', fontSize: 14,
                        fontWeight: selected ? 600 : 400,
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{
                        display: 'inline-block', width: 14, height: 14, borderRadius: '50%',
                        border: `1.5px solid ${selected ? '#b05a40' : '#d4b0a0'}`,
                        background: selected ? '#b05a40' : 'transparent',
                        marginRight: 12, verticalAlign: 'middle', position: 'relative', top: -1,
                        flexShrink: 0,
                      }} />
                      {opt}
                    </button>
                  );
                })}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 }}>
                  <button
                    disabled={step === 0}
                    onClick={() => setStep(step - 1)}
                    style={{
                      background: 'none', border: 'none',
                      color: step === 0 ? '#d4c0b8' : '#b89080',
                      fontFamily: 'inherit', fontSize: 13,
                      cursor: step === 0 ? 'not-allowed' : 'pointer',
                      textDecoration: 'underline', textUnderlineOffset: 3, padding: 0,
                    }}
                  >
                    ← Previous
                  </button>
                  <button
                    disabled={!isAnswered}
                    onClick={() => setStep(step + 1)}
                    style={{
                      background: isAnswered ? 'linear-gradient(135deg, #7a2e20, #c4714e)' : '#d4b4a8',
                      color: '#fff', border: 'none', borderRadius: 100,
                      padding: '13px 32px',
                      fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
                      letterSpacing: '0.09em', textTransform: 'uppercase',
                      cursor: isAnswered ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 34, fontWeight: 300, marginBottom: 8, color: '#3a1e0e' }}>
                  <em>One last thought.</em>
                </h2>
                <p style={{ fontSize: 13, color: '#b89080', marginBottom: 24, lineHeight: 1.6 }}>
                  Optional — but we genuinely read these.
                </p>
                <textarea
                  onChange={(e) => setSuggestions(e.target.value)}
                  style={{
                    width: '100%', padding: 16,
                    border: '1.5px solid #e8d0c4', borderRadius: 14,
                    minHeight: 120, fontFamily: 'inherit', fontSize: 14,
                    color: '#3a1e0e', background: '#fdf8f2',
                    resize: 'vertical', lineHeight: 1.65,
                    outline: 'none',
                  }}
                  placeholder="How would you improve safety infrastructure?"
                />
                <button
                  onClick={submitFinal}
                  style={{
                    width: '100%', marginTop: 20,
                    background: 'linear-gradient(135deg, #7a2e20, #c4714e)',
                    color: '#fff', border: 'none', borderRadius: 100,
                    padding: 16, fontFamily: 'inherit', fontSize: 12,
                    fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                  }}
                >
                  Submit Contribution
                </button>
              </>
            )}
          </div>
        </div>
      ) : (

        /* ── Admin Dashboard ── */
        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 28px 80px' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 36, fontWeight: 300, color: '#3a1e0e', marginBottom: 32 }}>
            Insight Dashboard
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
            {questions.map(q => {
              const entries = Object.entries(liveStats[q.id] || {});
              const total   = entries.reduce((a, [, v]) => a + v, 0) || 1;
              return (
                <div key={q.id} style={{ background: '#fff', border: '1.5px solid #e8d0c4', borderRadius: 20, padding: '22px 20px' }}>
                  <h4 style={{ fontSize: 12, fontWeight: 600, color: '#8a6050', marginBottom: 14, lineHeight: 1.5 }}>{q.text}</h4>
                  <ResponsiveContainer width="100%" height={170}>
                    <PieChart>
                      <Pie
                        data={entries.map(([name, value]) => ({ name, value }))}
                        dataKey="value" nameKey="name"
                        innerRadius={46} outerRadius={64}
                      >
                        {entries.map(([, ], index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ fontFamily: 'inherit', fontSize: 12, border: '1px solid #e8d0c4', borderRadius: 10, boxShadow: 'none' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Per-option legend with % */}
                  <div style={{ marginTop: 4 }}>
                    {entries.map(([name, val], i) => (
                      <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div style={{ width: 7, height: 7, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                          <span style={{ fontSize: 11, color: '#8a6050' }}>{name}</span>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#3a1e0e' }}>
                          {Math.round((val / total) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}