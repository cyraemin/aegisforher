import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const questions = [
  { id: 'q1', text: "Do you feel safe navigating alone after 8 PM?", options: ["Safe & calm", "Vigilant", "Unsafe"] },
  { id: 'q2', text: "Do you share your live location when in a cab?", options: ["Always", "Sometimes", "Never"] },
  { id: 'q3', text: "Do you feel your neighborhood is safe in an emergency?", options: ["Yes", "Maybe", "No"] },
  { id: 'q4', text: "Do you carry any safety tools (pepper spray, etc.)?", options: ["Yes", "Sometimes", "Never"] },
  { id: 'q5', text: "Do you fake calls to feel safer in transit?", options: ["Often", "Rarely", "Never"] },
  { id: 'q6', text: "Do you trust official cyber-crime portals?", options: ["Yes", "Unsure", "No"] },
  { id: 'q7', text: "Is awareness about digital safety enough in schools?", options: ["Yes", "Needs work", "None"] },
  { id: 'q8', text: "Have you ever faced online harassment?", options: ["Yes", "No"] },
  { id: 'q9', text: "Does fear of judgment stop you from reporting?", options: ["Often", "Sometimes", "Never"] },
  { id: 'q10', text: "Would a unified safety app help you feel secure?", options: ["Yes", "Maybe", "No"] },
  { id: 'q11', text: "How often do you audit your social media privacy?", options: ["Weekly", "Monthly", "Rarely"] },
  { id: 'q12', text: "Do you trust law enforcement with digital evidence?", options: ["Fully", "Neutral", "Distrust"] },
  { id: 'q13', text: "Does seeing safety news increase your anxiety?", options: ["Yes", "Sometimes", "No"] },
  { id: 'q14', text: "Have you blocked someone for persistent creepy behavior?", options: ["Yes", "No"] },
  { id: 'q15', text: "Do you feel platforms provide adequate safety features?", options: ["Yes", "Somewhat", "No"] }
];

const COLORS = ['#f4d1d1', '#c8e6c9', '#fff9c4', '#b3e5fc', '#d1c4e9'];

// Retro-aesthetic classes
const aesthetic = {
  page: "min-h-screen bg-[#fdfaf6] p-6 font-mono text-[#5d4037]",
  window: "bg-[#fffef9] border-2 border-[#5d4037] shadow-[8px_8px_0px_0px_rgba(93,64,55,0.2)] p-6 rounded-sm",
  windowHeader: "flex items-center gap-2 mb-6 border-b-2 border-[#5d4037] pb-2",
  button: "w-full p-3 border border-[#5d4037] hover:bg-[#f4d1d1] transition-all text-left mb-2",
  activeBtn: "bg-[#f4d1d1] font-bold"
};

export default function App() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [suggestions, setSuggestions] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [liveStats, setLiveStats] = useState({});
  const [user, setUser] = useState(null);

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
    const email = prompt("Enter your admin email:");
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

  return (
    <div className={aesthetic.page}>
      {/* Navbar/Header */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-end border-b-4 border-[#5d4037] pb-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter">AEGIS RESEARCH</h1>
          <p className="text-sm">Global Safety & Digital Integrity Project</p>
        </div>
        {user ? (
          <button onClick={() => setIsAdmin(!isAdmin)} className="bg-[#5d4037] text-white px-4 py-1 text-sm">
            {isAdmin ? "SURVEY" : "DASHBOARD"}
          </button>
        ) : (
          <button onClick={loginAsAdmin} className="border border-[#5d4037] px-4 py-1 text-sm">LOGIN</button>
        )}
      </div>

      {!isAdmin ? (
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Research Summary Section */}
          <div className={aesthetic.window}>
            <h3 className="font-bold mb-2">ABOUT THE RESEARCH</h3>
            <p className="text-sm leading-relaxed">
              This project analyzes the intersection of physical transit safety and digital privacy. 
              By examining user behavioral data, we aim to bridge the gap between individual anxiety 
              and institutional policy. Our goal is to create a safer, transparent ecosystem for all.
            </p>
          </div>

          {/* Survey Window */}
          <div className={aesthetic.window}>
            <div className={aesthetic.windowHeader}>
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span className="ml-auto text-xs opacity-50">survey.exe</span>
            </div>
            
            {step < questions.length ? (
              <div>
                <h2 className="text-xl mb-6">{questions[step].text}</h2>
                {questions[step].options.map(opt => (
                  <button key={opt} onClick={() => setFormData({...formData, [questions[step].id]: opt})}
                    className={`${aesthetic.button} ${formData[questions[step].id] === opt ? aesthetic.activeBtn : ''}`}>
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <h2 className="text-xl mb-4">Final Thoughts</h2>
                <textarea onChange={(e) => setSuggestions(e.target.value)} className="w-full p-4 border border-[#5d4037] mb-4 bg-transparent" placeholder="Improvement suggestions..." />
                <button onClick={submitFinal} className="w-full bg-[#5d4037] text-white p-4 font-bold">SUBMIT DATA</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {questions.map(q => (
            <div key={q.id} className={aesthetic.window}>
              <h4 className="font-bold text-xs mb-4 uppercase">{q.text}</h4>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={Object.entries(liveStats[q.id] || {}).map(([name, value]) => ({name, value}))} dataKey="value" innerRadius={40} outerRadius={60}>
                    {Object.entries(liveStats[q.id] || {}).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </PieChart>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}