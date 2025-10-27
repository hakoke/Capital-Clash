import { Newspaper, Sparkles } from 'lucide-react'

function NewsPanel({ news }) {
  return (
    <div className="glass rounded-xl p-6 card-glow">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="w-6 h-6 text-neon-purple" />
        <h3 className="text-xl font-bold">World News</h3>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {news.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No news yet. Start playing to see AI-generated events!</p>
          </div>
        ) : (
          news.map((item) => (
            <div
              key={item.id}
              className="bg-card-bg rounded-lg p-4 border border-gray-700 hover:border-neon-purple transition-all"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-neon-purple flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="font-bold mb-1">{item.headline}</h4>
                  <p className="text-sm text-gray-400 line-clamp-3">{item.story}</p>
                  <p className="text-xs text-gray-500 mt-2">
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

