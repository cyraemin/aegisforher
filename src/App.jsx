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

const COLORS = ['#5d4037', '#8d6e63', '#a1887f', '#bcaaa4', '#d7ccc8'];

const aesthetic = {
  container: "min-h-screen bg-[#fdfaf6] p-6 font-serif text-[#5d4037]",
  card: "bg-white p-8 rounded-[2rem] shadow-sm border border-[#f0e6e6] mb-8",
  button: "w-full p-4 mb-3 rounded-2xl text-left border transition-all duration-300",
  activeBtn: "bg-[#f4d1d1] border-[#eec0c0] text-[#5d4037] font-bold",
  inactiveBtn: "bg-white hover:bg-[#fdfaf6] border-[#f0e6e6]"
};

export default function App() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [suggestions, setSuggestions] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [liveStats, setLiveStats] = useState({});

  useEffect(() => {
    if (isAdmin) {
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
  }, [isAdmin]);

  const handleAdmin = () => {
    const key = prompt("Enter Admin Key:");
    if (key === 'aegis2026') setIsAdmin(true);
  };

  const submitFinal = async () => {
    await supabase.from('survey_responses').insert([formData]);
    if (suggestions.trim()) await supabase.from('text_suggestions').insert([{ suggestion: suggestions }]);
    alert("Contribution recorded. Thank you!");
    window.location.reload();
  };

  return (
    <div className={aesthetic.container}>
      <div className="flex justify-between items-center mb-10 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-light text-[#bcaaa4]">AEGIS FOR HER</h1>
          <p className="text-xs uppercase tracking-[0.3em] text-[#a1887f]">Global Safety Research Project</p>
        </div>
        <button onClick={handleAdmin} className="bg-[#f4d1d1] px-6 py-2 rounded-full text-sm font-bold">Admin</button>
      </div>

      {!isAdmin ? (
        <div className="max-w-xl mx-auto bg-white p-10 rounded-[3rem] shadow-sm border border-[#f0e6e6]">
          {/* ... (keep your existing survey form logic here) ... */}
          {step < questions.length ? (
            <div>
              <p className="text-xs text-[#a1887f] mb-4 font-bold tracking-widest uppercase">Question {step + 1} of 15</p>
              <h2 className="text-2xl font-light mb-8">{questions[step].text}</h2>
              {questions[step].options.map(opt => (
                <button key={opt} onClick={() => setFormData({...formData, [questions[step].id]: opt})}
                  className={`${aesthetic.button} ${formData[questions[step].id] === opt ? aesthetic.activeBtn : aesthetic.inactiveBtn}`}>
                  {opt}
                </button>
              ))}
              <div className="flex justify-between mt-10">
                <button disabled={step === 0} onClick={() => setStep(step - 1)} className="text-sm underline opacity-50">Previous</button>
                <button disabled={!formData[questions[step].id]} onClick={() => setStep(step + 1)} className="bg-[#5d4037] text-white px-8 py-3 rounded-full font-bold">Next</button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-light mb-6">Final Thought</h2>
              <textarea onChange={(e) => setSuggestions(e.target.value)} className="w-full p-4 border border-[#f0e6e6] rounded-2xl mb-6 bg-[#fdfaf6]" placeholder="How would you improve safety infrastructure?" />
              <button onClick={submitFinal} className="w-full bg-[#5d4037] text-white py-4 rounded-2xl font-bold">SUBMIT CONTRIBUTION</button>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-light text-[#8d6e63]">Insight Dashboard</h2>
            <button onClick={() => window.location.reload()} className="bg-[#f4d1d1] px-6 py-2 rounded-full text-sm font-bold">Refresh Data</button>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#f0e6e6] mb-8">
            <h3 className="text-sm uppercase text-[#a1887f]">Total Responses</h3>
            <p className="text-3xl font-bold">{Object.values(liveStats.q1 || {}).reduce((a, b) => a + b, 0)}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {questions.map(q => (
              <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-[#f0e6e6]">
                <h4 className="font-bold text-sm mb-4">{q.text}</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={Object.entries(liveStats[q.id] || {}).map(([name, value]) => ({name, value}))} 
                         dataKey="value" nameKey="name" innerRadius={50} outerRadius={70}>
                      {Object.entries(liveStats[q.id] || {}).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}