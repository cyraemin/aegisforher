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

const aesthetic = {
  page: "min-h-screen bg-[#fdfaf6] p-6 md:p-12 font-serif text-[#7d6b62]",
  card: "bg-[#fffefb] p-8 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#efe9e3]",
  button: "w-full p-4 mb-3 rounded-2xl text-left border border-[#efe9e3] hover:bg-[#fcf3f3] transition-all duration-300",
  activeBtn: "bg-[#f4d1d1] border-[#eec0c0] font-bold text-[#5d4037]",
  navButton: "px-6 py-2 rounded-full border border-[#efe9e3] hover:bg-[#fcf3f3] text-sm transition-all"
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
      {/* Unified Aesthetic Header */}
      <div className="max-w-4xl mx-auto mb-12 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-light text-[#7d6b62]">AEGIS FOR HER</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] mt-1 text-[#bcaaa4]">Research & Safety Initiative</p>
        </div>
        {user ? (
          <button onClick={() => setIsAdmin(!isAdmin)} className={aesthetic.navButton}>
            {isAdmin ? "Back to Survey" : "Admin Dashboard"}
          </button>
        ) : (
          <button onClick={loginAsAdmin} className={aesthetic.navButton}>Login</button>
        )}
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        {!isAdmin ? (
          <>
            {/* Research Context Card */}
            <div className={aesthetic.card}>
              <h3 className="font-bold mb-2 text-[#5d4037]">Research Overview</h3>
              <p className="text-sm leading-relaxed opacity-80 italic">
                Our research focuses on the intersection of digital privacy and physical transit safety. 
                By mapping user experiences, we strive to build a more secure world, one contribution at a time.
              </p>
            </div>

            {/* Survey Interaction Card */}
            <div className={aesthetic.card}>
              {step < questions.length ? (
                <div>
                  <p className="text-[10px] uppercase mb-6 tracking-widest opacity-60">Question {step + 1} / 15</p>
                  <h2 className="text-xl mb-8 text-[#5d4037]">{questions[step].text}</h2>
                  {questions[step].options.map(opt => (
                    <button key={opt} onClick={() => setFormData({...formData, [questions[step].id]: opt})}
                      className={`${aesthetic.button} ${formData[questions[step].id] === opt ? aesthetic.activeBtn : ''}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <h2 className="text-xl mb-4 text-[#5d4037]">Final Thoughts</h2>
                  <textarea onChange={(e) => setSuggestions(e.target.value)} className="w-full p-4 border border-[#efe9e3] rounded-2xl mb-6 bg-[#fdfaf6]" placeholder="Share your vision..." />
                  <button onClick={submitFinal} className="w-full bg-[#7d6b62] text-white py-4 rounded-2xl font-bold hover:bg-[#5d4037] transition-all">SUBMIT</button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Insight Dashboard View */
          <div className="space-y-6">
            <h2 className="text-2xl text-[#7d6b62]">Insight Dashboard</h2>
            {questions.map(q => (
              <div key={q.id} className={aesthetic.card}>
                <h4 className="font-bold text-sm mb-4 uppercase tracking-wider">{q.text}</h4>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={Object.entries(liveStats[q.id] || {}).map(([name, value]) => ({name, value}))} dataKey="value" innerRadius={40} outerRadius={60}>
                      {Object.entries(liveStats[q.id] || {}).map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}