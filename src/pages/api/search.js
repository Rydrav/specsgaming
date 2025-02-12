// pages/api/search.js
import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  const { query } = req.query

  // Leer los datos de juegos desde el archivo JSON
  const filePath = path.join(process.cwd(), 'data/juegos.json')
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const games = JSON.parse(fileContent)

  // Filtrar juegos que coincidan con el título
  const filteredGames = games.filter(game =>
    game.data.name.toLowerCase().includes(query.toLowerCase())
  )

  res.status(200).json(filteredGames)
}
