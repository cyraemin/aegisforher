import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

// ── Questions ─────────────────────────────────────────────────────────────────

const questions = [
  { id: 'q1',  text: "Do you feel safe navigating alone after 8 PM?",          options: ["Safe & calm", "Vigilant", "Unsafe"],    category: 'transit' },
  { id: 'q2',  text: "Do you share your live location when in a cab?",           options: ["Always", "Sometimes", "Never"],         category: 'transit' },
  { id: 'q3',  text: "Do you feel your neighborhood is safe in an emergency?",   options: ["Yes", "Maybe", "No"],                   category: 'transit' },
  { id: 'q4',  text: "Do you carry any safety tools (pepper spray, etc.)?",      options: ["Yes", "Sometimes", "Never"],            category: 'transit' },
  { id: 'q5',  text: "Do you fake calls to feel safer in transit?",              options: ["Often", "Rarely", "Never"],             category: 'transit' },
  { id: 'q6',  text: "Do you trust official cyber-crime portals?",               options: ["Yes", "Unsure", "No"],                  category: 'digital' },
  { id: 'q7',  text: "Is awareness about digital safety enough in schools?",     options: ["Yes", "Needs work", "None"],            category: 'digital' },
  { id: 'q8',  text: "Have you ever faced online harassment?",                   options: ["Yes", "No"],                            category: 'digital' },
  { id: 'q9',  text: "Does fear of judgment stop you from reporting?",           options: ["Often", "Sometimes", "Never"],          category: 'digital' },
  { id: 'q10', text: "Would a unified safety app help you feel secure?",         options: ["Yes", "Maybe", "No"],                   category: 'digital' },
  { id: 'q11', text: "How often do you audit your social media privacy?",        options: ["Weekly", "Monthly", "Rarely"],          category: 'digital' },
  { id: 'q12', text: "Do you trust law enforcement with digital evidence?",      options: ["Fully", "Neutral", "Distrust"],         category: 'trust'   },
  { id: 'q13', text: "Does seeing safety news increase your anxiety?",           options: ["Yes", "Sometimes", "No"],               category: 'trust'   },
  { id: 'q14', text: "Have you blocked someone for persistent creepy behavior?", options: ["Yes", "No"],                            category: 'trust'   },
  { id: 'q15', text: "Do you feel platforms provide adequate safety features?",  options: ["Yes", "Somewhat", "No"],                category: 'trust'   },
];

// Which answer represents the "concerning" signal for each question
const CONCERNING = {
  q1:  ['Vigilant', 'Unsafe'],
  q2:  ['Never'],
  q3:  ['No'],
  q4:  ['Never'],
  q5:  ['Often'],
  q6:  ['No'],
  q7:  ['None'],
  q8:  ['Yes'],
  q9:  ['Often', 'Sometimes'],
  q10: ['Yes'],
  q11: ['Rarely'],
  q12: ['Distrust', 'Neutral'],
  q13: ['Yes', 'Sometimes'],
  q14: ['Yes'],
  q15: ['No'],
};

const CONCERNING_LABEL = {
  q1:  'feel unsafe or vigilant after 8 PM',
  q2:  'never share live location in cabs',
  q3:  'doubt neighborhood safety in emergencies',
  q4:  'carry no safety tools at all',
  q5:  'frequently fake calls to feel safer',
  q6:  'distrust official cyber-crime portals',
  q7:  'say schools teach no digital safety',
  q8:  'have experienced online harassment',
  q9:  'are deterred from reporting by fear of judgment',
  q10: 'say a unified safety app would help',
  q11: 'rarely audit their social media privacy',
  q12: 'are neutral or actively distrust law enforcement',
  q13: 'say safety news increases their anxiety',
  q14: 'have had to block someone for harassment',
  q15: 'feel platforms provide inadequate safety features',
};

const COLORS   = ['#7a2e20', '#b05a40', '#c4714e', '#d9967e', '#edcabc'];
const CAT_TABS = [
  { key: 'all',     label: 'All Questions'       },
  { key: 'transit', label: 'Transit & Physical'  },
  { key: 'digital', label: 'Digital & Online'    },
  { key: 'trust',   label: 'Trust & Perception'  },
];

// ── Research data ─────────────────────────────────────────────────────────────

const FACTS = [
  { stat: '1 in 3',  desc: 'women globally experience physical or sexual violence in their lifetime', source: 'WHO, 2021',             color: '#fdf0eb', accent: '#c4714e' },
  { stat: '8 in 10', desc: 'girls report sexual harassment in public spaces across major cities',     source: 'Plan International, 2018', color: '#f5eef8', accent: '#9b59b6' },
  { stat: '41%',     desc: 'of women have experienced severe online harassment including stalking',   source: 'Pew Research, 2021',      color: '#eaf4fb', accent: '#2980b9' },
  { stat: '< 10%',   desc: 'of sexual violence incidents are ever formally reported to authorities', source: 'UN Women, 2022',          color: '#eafaf1', accent: '#27ae60' },
];

const PAPERS = [
  { tag: 'Global Health',         tagColor: '#c4714e', title: 'Violence Against Women — Global Fact Sheet',   org: 'World Health Organization (WHO)', desc: 'Global prevalence estimates on physical, sexual, and intimate partner violence. The definitive source on scale.',                                                url: 'https://www.who.int/news-room/fact-sheets/detail/violence-against-women' },
  { tag: 'Digital Safety',        tagColor: '#2980b9', title: 'The State of Online Harassment',               org: 'Pew Research Center',             desc: 'Documents how women face disproportionately severe digital abuse — sexual harassment, stalking, and doxxing.',                                               url: 'https://www.pewresearch.org/internet/2021/01/13/the-state-of-online-harassment/' },
  { tag: 'Transit & Public Spaces', tagColor: '#9b59b6', title: "Free to Be: Girls' Safety in Public Spaces", org: 'Plan International',              desc: 'Survey of 22,000 girls across 22 cities on street harassment, unsafe transit, and psychological impact.',                                                    url: 'https://plan-international.org/unsafe-in-the-city/' },
  { tag: 'Policy & Infrastructure', tagColor: '#27ae60', title: 'Safe Cities and Safe Public Spaces',         org: 'UN Women',                        desc: 'Global programme on combating sexual harassment in cities — frameworks, interventions, and outcomes.',                                                      url: 'https://www.unwomen.org/en/what-we-do/ending-violence-against-women/creating-safe-public-spaces' },
];

// ── Style primitives ──────────────────────────────────────────────────────────

const serif = (size, extra = {}) => ({ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: size, fontWeight: 300, lineHeight: 1.2, color: '#3a1e0e', ...extra });
const C = { paper: '#fdf8f2', white: '#ffffff', border: '#e8d0c4', text: '#3a1e0e', muted: '#8a6050', light: '#b89080', accent: '#b05a40', grad1: '#7a2e20', grad2: '#c4714e' };

// ── Small components ──────────────────────────────────────────────────────────

const ShieldMini = () => (
  <svg width="16" height="19" viewBox="0 0 22 26" fill="none" style={{ flexShrink: 0 }}>
    <path d="M11 1.5L20.5 5.5V14C20.5 18.8 16.5 22.5 11 24.5C5.5 22.5 1.5 18.8 1.5 14V5.5Z" stroke={C.accent} strokeWidth="1.3" fill={`${C.accent}12`} />
    <path d="M7.5 12.5L10 15L14.5 10" stroke={C.accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Leaf = ({ style }) => (
  <svg width="28" height="40" viewBox="0 0 28 40" fill="none" style={style}>
    <path d="M14 2 C20 8 24 16 22 26 C20 34 14 38 14 38 C14 38 8 34 6 26 C4 16 8 8 14 2Z" fill={`${C.accent}18`} />
  </svg>
);

const OptionBtn = ({ opt, selected, onClick }) => (
  <button onClick={onClick} style={{
    display: 'block', width: '100%', padding: '13px 18px', marginBottom: 10,
    borderRadius: 14, textAlign: 'left', cursor: 'pointer',
    border: `1.5px solid ${selected ? C.accent : C.border}`,
    background: selected ? 'rgba(176,90,64,0.09)' : C.white,
    color: selected ? C.grad1 : C.muted,
    fontFamily: 'inherit', fontSize: 14, fontWeight: selected ? 600 : 400, transition: 'all 0.15s',
  }}>
    <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', border: `1.5px solid ${selected ? C.accent : '#d4b0a0'}`, background: selected ? C.accent : 'transparent', marginRight: 12, verticalAlign: 'middle', position: 'relative', top: -1 }} />
    {opt}
  </button>
);

// ── CSV export helper ─────────────────────────────────────────────────────────

const exportCSV = (liveStats) => {
  const rows = ['Question ID,Question Text,Option,Count,Percentage'];
  questions.forEach(q => {
    const entries = Object.entries(liveStats[q.id] || {});
    const total   = entries.reduce((a, [, v]) => a + v, 0) || 1;
    entries.forEach(([opt, count]) => {
      rows.push(`${q.id},"${q.text}","${opt}",${count},${Math.round(count / total * 100)}%`);
    });
  });
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'aegis-survey-results.csv'; a.click();
  URL.revokeObjectURL(url);
};

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [step, setStep]                   = useState(0);
  const [formData, setFormData]           = useState({});
  const [suggestions, setSuggestions]     = useState('');
  const [isAdmin, setIsAdmin]             = useState(false);
  const [liveStats, setLiveStats]         = useState({});
  const [rawRecords, setRawRecords]       = useState([]);
  const [textSuggestions, setTextSuggestions] = useState([]);
  const [activeCategory, setActiveCategory]   = useState('all');
  const [user, setUser]                   = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.email === 'tamsilsamira@gmail.com') {
      const fetchAll = async () => {
        const [{ data: records }, { data: textRows }] = await Promise.all([
          supabase.from('survey_responses').select('*'),
          supabase.from('text_suggestions').select('suggestion, created_at').order('created_at', { ascending: false }),
        ]);

        setRawRecords(records || []);
        setTextSuggestions(textRows || []);

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
      fetchAll();
    }
  }, [isAdmin, user]);

  const loginAsAdmin = async () => {
    const email    = prompt("Enter your admin email:");
    const password = prompt("Enter your admin password:");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else window.location.reload();
  };

  const submitFinal = async () => {
    await supabase.from('survey_responses').insert([formData]);
    if (suggestions.trim()) await supabase.from('text_suggestions').insert([{ suggestion: suggestions }]);
    alert("Contribution recorded. Thank you!");
    window.location.reload();
  };

  // ── Computed dashboard values ──────────────────────────────────────────────

  const totalResponses = rawRecords.length;

  const concerningPct = (qid) => {
    const entries   = Object.entries(liveStats[qid] || {});
    const total     = entries.reduce((a, [, v]) => a + v, 0) || 1;
    const concerned = entries.filter(([name]) => CONCERNING[qid]?.includes(name)).reduce((a, [, v]) => a + v, 0);
    return Math.round((concerned / total) * 100);
  };

  const topAnswer = (qid) => {
    const entries = Object.entries(liveStats[qid] || {});
    if (!entries.length) return { name: '—', pct: 0 };
    const total   = entries.reduce((a, [, v]) => a + v, 0) || 1;
    const [name, val] = entries.sort(([, a], [, b]) => b - a)[0];
    return { name, pct: Math.round(val / total * 100) };
  };

  const filteredQuestions = activeCategory === 'all'
    ? questions
    : questions.filter(q => q.category === activeCategory);

  const q1 = questions[0];

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.paper, fontFamily: "'DM Sans', system-ui, sans-serif", color: C.text }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        * { box-sizing: border-box; }
        a { text-decoration: none; }
        a:hover { text-decoration: underline; }
        button:focus-visible { outline: 2px solid #b05a40; outline-offset: 3px; }
        textarea:focus { outline: 1.5px solid #b05a40; }
        @media (max-width: 640px) {
          .fact-grid  { grid-template-columns: 1fr 1fr !important; }
          .paper-grid { grid-template-columns: 1fr !important; }
          .survey-pad { padding: 28px 22px !important; }
          .admin-grid { grid-template-columns: 1fr !important; }
          .headline-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '26px 36px', maxWidth: 1040, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldMini />
          <div>
            <h1 style={{ ...serif(22), letterSpacing: '0.07em', color: C.accent, margin: 0 }}>AEGIS FOR HER</h1>
            <p style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.light, margin: '3px 0 0' }}>Global Safety Research Project</p>
          </div>
        </div>
        {user ? (
          user.email === 'tamsilsamira@gmail.com' ? (
            <button onClick={() => setIsAdmin(!isAdmin)} style={{ background: isAdmin ? 'transparent' : `linear-gradient(135deg, ${C.grad1}, ${C.grad2})`, color: isAdmin ? C.accent : '#fff', border: isAdmin ? `1.5px solid ${C.border}` : 'none', padding: '10px 24px', borderRadius: 100, fontFamily: 'inherit', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', cursor: 'pointer' }}>
              {isAdmin ? '← Back to Survey' : 'Admin Dashboard'}
            </button>
          ) : null
        ) : (
          <button onClick={loginAsAdmin} style={{ background: 'transparent', color: C.light, border: `1.5px solid ${C.border}`, padding: '10px 24px', borderRadius: 100, fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
            Login
          </button>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          LANDING  (step 0, not admin)
          ════════════════════════════════════════════════════════════════════ */}
      {!isAdmin && step === 0 && (
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 100px' }}>

          <div style={{ textAlign: 'center', padding: '32px 0 44px', position: 'relative' }}>
            <Leaf style={{ position: 'absolute', top: 10, right: 30, opacity: 0.7 }} />
            <Leaf style={{ position: 'absolute', top: 40, left: 20, opacity: 0.5, transform: 'rotate(-30deg) scaleX(-1)' }} />
            <p style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.light, marginBottom: 16 }}>Your voice shapes safer spaces</p>
            <h2 style={{ ...serif(46), letterSpacing: '-0.01em', marginBottom: 16 }}><em>Why does women's safety</em><br />still need to be measured?</h2>
            <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.8, maxWidth: 540, margin: '0 auto', fontWeight: 300 }}>
              Because it is still not guaranteed. Across transit, streets, and the internet, women navigate fear daily — yet policy decisions rarely center their lived experience.
              <strong style={{ fontWeight: 600, color: C.accent }}> Aegis For Her</strong> exists to change that, starting with honest data collected anonymously from people like you.
            </p>
          </div>

          {/* Q1 card */}
          <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 28, padding: '40px 44px', boxShadow: '0 8px 48px rgba(58,30,14,0.08)', marginBottom: 56 }} className="survey-pad">
            <div style={{ height: 3, background: `linear-gradient(90deg, ${C.grad1}, ${C.grad2})`, borderRadius: 99, marginBottom: 28 }} />
            <p style={{ fontSize: 10, color: C.light, fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 14 }}>Question 1 of 15 · Begin here</p>
            <h2 style={{ ...serif(28), lineHeight: 1.35, marginBottom: 28 }}>{q1.text}</h2>
            {q1.options.map(opt => <OptionBtn key={opt} opt={opt} selected={formData['q1'] === opt} onClick={() => setFormData({ ...formData, q1: opt })} />)}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28 }}>
              <button disabled={!formData['q1']} onClick={() => setStep(1)} style={{ background: formData['q1'] ? `linear-gradient(135deg, ${C.grad1}, ${C.grad2})` : '#d4b4a8', color: '#fff', border: 'none', borderRadius: 100, padding: '13px 36px', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', cursor: formData['q1'] ? 'pointer' : 'not-allowed' }}>Next →</button>
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}><div style={{ flex: 1, height: 1, background: C.border }} /><span style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.light, whiteSpace: 'nowrap' }}>Why this research matters</span><div style={{ flex: 1, height: 1, background: C.border }} /></div>

          {/* Fact pins */}
          <div style={{ marginBottom: 56 }}>
            <h3 style={{ ...serif(32), marginBottom: 6 }}>The numbers don't lie.</h3>
            <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, marginBottom: 28, fontWeight: 300 }}>These are not edge cases. This is the baseline reality for women worldwide.</p>
            <div className="fact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {FACTS.map((f, i) => (
                <div key={i} style={{ background: f.color, borderRadius: 20, border: `1px solid ${f.accent}28`, padding: '24px 22px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -18, right: -18, width: 80, height: 80, borderRadius: '50%', background: `${f.accent}14` }} />
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 400, color: f.accent, lineHeight: 1, marginBottom: 8 }}>{f.stat}</div>
                  <p style={{ fontSize: 13, color: C.text, lineHeight: 1.55, marginBottom: 10, fontWeight: 400 }}>{f.desc}</p>
                  <span style={{ fontSize: 10, color: f.accent, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>— {f.source}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}><div style={{ flex: 1, height: 1, background: C.border }} /><span style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.light, whiteSpace: 'nowrap' }}>Research you can read</span><div style={{ flex: 1, height: 1, background: C.border }} /></div>

          {/* Papers */}
          <div style={{ marginBottom: 56 }}>
            <h3 style={{ ...serif(32), marginBottom: 6 }}>Grounded in real science.</h3>
            <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, marginBottom: 28, fontWeight: 300 }}>Our survey is designed around published research. Explore the studies that shaped our questions.</p>
            <div className="paper-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {PAPERS.map((p, i) => (
                <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', background: C.white, borderRadius: 20, border: `1.5px solid ${C.border}`, padding: '22px 20px', cursor: 'pointer', color: 'inherit', textDecoration: 'none', transition: 'box-shadow 0.2s, border-color 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 28px rgba(58,30,14,0.1)'; e.currentTarget.style.borderColor = p.tagColor + '60'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = C.border; }}>
                  <span style={{ display: 'inline-block', background: p.tagColor + '18', color: p.tagColor, fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 100, marginBottom: 14 }}>{p.tag}</span>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: C.text, lineHeight: 1.45, marginBottom: 8 }}>{p.title}</h4>
                  <p style={{ fontSize: 11, color: C.light, fontWeight: 500, marginBottom: 10 }}>{p.org}</p>
                  <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>{p.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: p.tagColor, fontSize: 12, fontWeight: 600 }}>Read paper <span style={{ fontSize: 14 }}>→</span></div>
                </a>
              ))}
            </div>
          </div>

          {/* How data helps */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}><div style={{ flex: 1, height: 1, background: C.border }} /><span style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.light, whiteSpace: 'nowrap' }}>How your answers help</span><div style={{ flex: 1, height: 1, background: C.border }} /></div>
          <div style={{ background: `linear-gradient(135deg, ${C.grad1}10, ${C.grad2}18)`, border: `1.5px solid ${C.border}`, borderRadius: 24, padding: '36px 38px', marginBottom: 56 }}>
            <h3 style={{ ...serif(30), marginBottom: 20 }}>Your 3 minutes.<br /><em>Real policy impact.</em></h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
              {[{ title: 'Data for advocacy', body: "Aggregated results are shared with women's rights NGOs and city safety planners to prioritize infrastructure." }, { title: 'Academic research', body: 'Anonymous responses feed into published research on safety perception gaps between policy and lived reality.' }, { title: 'Product design', body: 'Insights guide tech teams building safety apps, digital reporting tools, and community alert systems.' }].map((item, i) => (
                <div key={i}>
                  <h4 style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>{item.title}</h4>
                  <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.65, fontWeight: 300 }}>{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
            <p style={{ ...serif(22), color: C.muted, marginBottom: 20 }}><em>Answer Q1 above and continue — it takes under 3 minutes.</em></p>
            <button disabled={!formData['q1']} onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(() => setStep(1), 400); }}
              style={{ background: formData['q1'] ? `linear-gradient(135deg, ${C.grad1}, ${C.grad2})` : '#d4b4a8', color: '#fff', border: 'none', borderRadius: 100, padding: '14px 40px', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: formData['q1'] ? 'pointer' : 'not-allowed' }}>
              {formData['q1'] ? 'Continue Survey →' : 'Answer Q1 first to continue'}
            </button>
            <p style={{ fontSize: 11, color: C.light, marginTop: 12 }}>All responses are anonymous · No account needed</p>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          COMPACT SURVEY  (steps 1–14)
          ════════════════════════════════════════════════════════════════════ */}
      {!isAdmin && step >= 1 && step < questions.length && (
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '8px 20px 80px' }}>
          <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 28, padding: '44px 46px', boxShadow: '0 8px 48px rgba(58,30,14,0.07)' }} className="survey-pad">
            <div style={{ height: 2, background: '#f2e2da', borderRadius: 99, marginBottom: 32 }}>
              <div style={{ height: '100%', width: `${(step / questions.length) * 100}%`, background: `linear-gradient(90deg, ${C.grad1}, ${C.grad2})`, borderRadius: 99, transition: 'width 0.35s ease' }} />
            </div>
            <p style={{ fontSize: 10, color: C.light, fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 14 }}>Question {step + 1} of 15</p>
            <h2 style={{ ...serif(26), lineHeight: 1.38, marginBottom: 28 }}>{questions[step].text}</h2>
            {questions[step].options.map(opt => <OptionBtn key={opt} opt={opt} selected={formData[questions[step].id] === opt} onClick={() => setFormData({ ...formData, [questions[step].id]: opt })} />)}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 }}>
              <button disabled={step === 0} onClick={() => setStep(step - 1)} style={{ background: 'none', border: 'none', color: step === 0 ? '#d4c0b8' : C.light, fontFamily: 'inherit', fontSize: 13, cursor: step === 0 ? 'not-allowed' : 'pointer', textDecoration: 'underline', textUnderlineOffset: 3, padding: 0 }}>← Previous</button>
              <button disabled={!formData[questions[step].id]} onClick={() => setStep(step + 1)} style={{ background: formData[questions[step].id] ? `linear-gradient(135deg, ${C.grad1}, ${C.grad2})` : '#d4b4a8', color: '#fff', border: 'none', borderRadius: 100, padding: '13px 32px', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', cursor: formData[questions[step].id] ? 'pointer' : 'not-allowed' }}>Next</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          FINAL THOUGHT
          ════════════════════════════════════════════════════════════════════ */}
      {!isAdmin && step >= questions.length && (
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '8px 20px 80px' }}>
          <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 28, padding: '44px 46px', boxShadow: '0 8px 48px rgba(58,30,14,0.07)' }} className="survey-pad">
            <h2 style={{ ...serif(34), marginBottom: 8 }}><em>One last thought.</em></h2>
            <p style={{ fontSize: 13, color: C.light, marginBottom: 24, lineHeight: 1.6 }}>Optional — but we genuinely read these.</p>
            <textarea onChange={(e) => setSuggestions(e.target.value)} style={{ width: '100%', padding: 16, border: `1.5px solid ${C.border}`, borderRadius: 14, minHeight: 120, fontFamily: 'inherit', fontSize: 14, color: C.text, background: C.paper, resize: 'vertical', lineHeight: 1.65, outline: 'none' }} placeholder="How would you improve safety infrastructure?" />
            <button onClick={submitFinal} style={{ width: '100%', marginTop: 20, background: `linear-gradient(135deg, ${C.grad1}, ${C.grad2})`, color: '#fff', border: 'none', borderRadius: 100, padding: 16, fontFamily: 'inherit', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>Submit Contribution</button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          ADMIN DASHBOARD
          ════════════════════════════════════════════════════════════════════ */}
      {isAdmin && (
        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 28px 80px' }}>

          {/* ── Dashboard header ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
            <div>
              <h2 style={{ ...serif(38), margin: 0 }}>Insight Dashboard</h2>
              <p style={{ fontSize: 12, color: C.light, marginTop: 6 }}>{totalResponses} responses collected · Live data</p>
            </div>
            <button
              onClick={() => exportCSV(liveStats)}
              style={{ background: C.white, color: C.accent, border: `1.5px solid ${C.border}`, borderRadius: 100, padding: '10px 22px', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.05em' }}>
              Export CSV
            </button>
          </div>

          {/* ── Headline stats ── */}
          <div className="headline-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 36 }}>
            {[
              { label: 'Total responses',            value: totalResponses,           sub: 'survey submissions'           },
              { label: 'Feel unsafe / vigilant',     value: `${concerningPct('q1')}%`, sub: 'navigating alone after 8 PM'  },
              { label: 'Faced online harassment',    value: `${concerningPct('q8')}%`, sub: 'of respondents said yes'       },
              { label: 'Distrust law enforcement',   value: `${concerningPct('q12')}%`,sub: 'neutral or actively distrust'  },
            ].map(({ label, value, sub }) => (
              <div key={label} style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 18, padding: '22px 20px' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 400, color: C.grad1, lineHeight: 1, marginBottom: 6 }}>{value}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.text, marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 10, color: C.light }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* ── Key findings ── */}
          <div style={{ background: `${C.grad1}0a`, border: `1.5px solid ${C.border}`, borderRadius: 20, padding: '26px 28px', marginBottom: 36 }}>
            <h3 style={{ ...serif(22), marginBottom: 18 }}>Key findings</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {['q1','q5','q8','q9','q11','q12','q14','q15'].map(qid => {
                const pct = concerningPct(qid);
                if (!pct) return null;
                return (
                  <div key={qid} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: C.white, borderRadius: 12, border: `1px solid ${C.border}` }}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 400, color: C.accent, lineHeight: 1, flexShrink: 0, minWidth: 48 }}>{pct}%</div>
                    <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, margin: 0, paddingTop: 2 }}>{CONCERNING_LABEL[qid]}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Category filter tabs ── */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            {CAT_TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveCategory(tab.key)} style={{
                padding: '8px 18px', borderRadius: 100, fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                border: `1.5px solid ${activeCategory === tab.key ? C.accent : C.border}`,
                background: activeCategory === tab.key ? `${C.accent}12` : C.white,
                color: activeCategory === tab.key ? C.accent : C.muted,
              }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Question charts ── */}
          <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
            {filteredQuestions.map(q => {
              const entries = Object.entries(liveStats[q.id] || {});
              const total   = entries.reduce((a, [, v]) => a + v, 0) || 1;
              const top     = topAnswer(q.id);
              return (
                <div key={q.id} style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 18, padding: '22px 20px' }}>
                  {/* Question text + top answer badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 18 }}>
                    <h4 style={{ fontSize: 12, fontWeight: 600, color: C.muted, lineHeight: 1.5, margin: 0 }}>{q.text}</h4>
                    <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, color: C.accent, background: `${C.accent}12`, padding: '3px 9px', borderRadius: 100, whiteSpace: 'nowrap' }}>
                      {top.pct}% {top.name}
                    </span>
                  </div>

                  {/* Horizontal bar chart */}
                  {entries.map(([name, val], i) => {
                    const pct        = Math.round((val / total) * 100);
                    const isConcerning = CONCERNING[q.id]?.includes(name);
                    return (
                      <div key={name} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: 12, color: isConcerning ? C.accent : C.muted, fontWeight: isConcerning ? 600 : 400 }}>{name}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: COLORS[i % COLORS.length] }}>{pct}% <span style={{ color: C.light, fontWeight: 400 }}>({val})</span></span>
                        </div>
                        <div style={{ height: 7, background: '#f2e2da', borderRadius: 99 }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: isConcerning ? `linear-gradient(90deg, ${C.grad1}, ${C.grad2})` : COLORS[i % COLORS.length], borderRadius: 99, transition: 'width 0.6s ease' }} />
                        </div>
                      </div>
                    );
                  })}

                  <div style={{ fontSize: 10, color: C.light, marginTop: 10 }}>{total} responses</div>
                </div>
              );
            })}
          </div>

          {/* ── Text suggestions ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.light, whiteSpace: 'nowrap' }}>Open-ended suggestions ({textSuggestions.length})</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>

          {textSuggestions.length === 0 ? (
            <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 18, padding: '32px', textAlign: 'center', color: C.light, fontSize: 13 }}>
              No text suggestions yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="admin-grid">
              {textSuggestions.map((row, i) => (
                <div key={i} style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 16, padding: '18px 20px' }}>
                  <p style={{ fontSize: 14, color: C.text, lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>"{row.suggestion}"</p>
                  {row.created_at && (
                    <p style={{ fontSize: 10, color: C.light, marginTop: 10, marginBottom: 0 }}>
                      {new Date(row.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
}