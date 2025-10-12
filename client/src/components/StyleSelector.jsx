export default function StyleSelector({ styles, selectedStyle, onSelectStyle }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select Your Style</h2>
      <div className="flex gap-4 justify-center">
        {styles.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelectStyle(style.name)}
            className={`px-8 py-3 rounded-xl font-medium transition-all ${
              selectedStyle === style.name
                ? 'bg-yellow-500 text-black'
                : 'bg-zinc-800 text-white hover:bg-zinc-700'
            }`}
          >
            {style.name}
          </button>
        ))}
      </div>
    </div>
  )
}
