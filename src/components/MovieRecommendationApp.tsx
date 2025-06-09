// MovieRecommendationApp.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';

const API_KEY = '424301143a12df0ba618031d25219f76';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const supabase = createClient(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_ANON_KEY);

export default function MovieRecommendationApp() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);

    useEffect(() => {
        const loadChatHistory = async () => {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .order('timestamp', { ascending: true });

            if (error) {
                console.error('Ошибка загрузки истории чата:', error);
            } else {
                setChatHistory(data);
            }
        };

        loadChatHistory();
    }, []);

    const fetchRecommendations = async (message) => {
        try {
            const res = await fetch(SUPABASE_URL + '/functions/v1/recommend-movies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message }),
            });

            const data = await res.json();
            return data.reply || 'Нет ответа от бота.';
        } catch (err) {
            console.error('Edge Function error:', err);
            return 'Ошибка получения ответа.';
        }
    };


    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        try {
            const aiReply = await fetchRecommendations(query);

            const titles = aiReply.match(/"([^"]+)"/g)?.map(t => t.replace(/"/g, '')) || [query];
            let allResults = [];

            for (const title of titles) {
                const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
                    params: {
                        api_key: API_KEY,
                        query: title,
                    },
                });
                allResults = [...allResults, ...response.data.results];
            }

            const movieMessage = allResults.length
                ? allResults
                    .map(m => `🎬 *${m.title}*\n${m.overview || 'Описание отсутствует'}\n⭐ ${m.vote_average}`)
                    .join('\n\n')
                : 'Не удалось найти фильмы по вашему запросу.';

            const newChat = {
                user_message: query,
                bot_response: movieMessage,
                timestamp: new Date().toISOString(),
            };

            setChatHistory(prev => [...prev, newChat]);

            await supabase.from('chat_messages').insert([newChat]);
            setQuery('');
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 flex flex-col h-screen">

            <div className="flex flex-col gap-4 flex-grow overflow-y-auto bg-gray-50 p-4 rounded-md">
                {chatHistory.map((chat, idx) => (
                    <div key={idx} className="flex flex-col gap-2">
                        <div className="self-end bg-blue-500 text-white p-3 rounded-xl max-w-[80%] shadow whitespace-pre-wrap">
                            {chat.user_message}
                        </div>
                        <div className="self-start bg-gray-200 text-gray-800 p-3 rounded-xl max-w-[80%] shadow whitespace-pre-wrap">
                            {chat.bot_response}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex gap-2">
                <Input
                    placeholder="Напиши: посоветуй крутой фильм..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-grow"
                />
                <Button onClick={handleSearch} disabled={loading}>
                    {loading ? '...' : '▶️'}
                </Button>
            </div>
        </div>
    );
}

