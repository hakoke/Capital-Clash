import { Newspaper, Sparkles } from 'lucide-react'

function NewsPanel({ news }) {
  return (
    <div className="glass rounded-xl p-3 card-glow">
      <div className="flex items-center gap-2 mb-2">
        <Newspaper className="w-5 h-5 text-neon-purple" />
        <h3 className="text-lg font-bold">World News</h3>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
        {news.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No news yet. Start playing to see AI-generated events!</p>
          </div>
        ) : (
          news.map((item) => (
            <div
              key={item.id}
              className="bg-card-bg rounded-lg p-3 border border-gray-700 hover:border-neon-purple transition-all"
            >
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-neon-purple flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm mb-1">{item.headline}</h4>
                  <p className="text-xs text-gray-400 line-clamp-2">{item.story}</p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Round {item.round_number} • {new Date(item.generated_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default NewsPanel
