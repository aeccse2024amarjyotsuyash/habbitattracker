import React, { useState } from 'react';
import { Calendar, Clock, Bell, Plus, Trash2 } from 'lucide-react';

interface Reminder {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
}

function App() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminder, setNewReminder] = useState<Omit<Reminder, 'id'>>({
    title: '',
    date: '',
    time: '',
    description: ''
  });

  const addReminder = () => {
    if (!newReminder.title || !newReminder.date || !newReminder.time) return;
    
    setReminders([
      ...reminders,
      {
        ...newReminder,
        id: Date.now().toString()
      }
    ]);
    
    setNewReminder({
      title: '',
      date: '',
      time: '',
      description: ''
    });
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center gap-3 mb-8">
          <Calendar className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-800">日历提醒工具</h1>
        </header>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" />
            添加新提醒
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="标题"
              className="p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={newReminder.title}
              onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
            />
            <input
              type="date"
              className="p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={newReminder.date}
              onChange={(e) => setNewReminder({...newReminder, date: e.target.value})}
            />
            <input
              type="time"
              className="p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={newReminder.time}
              onChange={(e) => setNewReminder({...newReminder, time: e.target.value})}
            />
            <input
              type="text"
              placeholder="描述"
              className="p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={newReminder.description}
              onChange={(e) => setNewReminder({...newReminder, description: e.target.value})}
            />
          </div>
          
          <button
            onClick={addReminder}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            添加提醒
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            提醒列表
          </h2>
          
          {reminders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无提醒事项</p>
          ) : (
            <div className="space-y-4">
              {reminders.map(reminder => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{reminder.title}</h3>
                    <p className="text-gray-600">{reminder.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {reminder.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {reminder.time}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;