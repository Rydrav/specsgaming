import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const ITEMS_PER_PAGE = 9

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)

  try {
    const filePath = path.join(process.cwd(), 'data', 'juegos.json')
    const fileContents = await fs.readFile(filePath, 'utf8')
    const games = JSON.parse(fileContents)

    const filteredGames = games.filter((game) =>
      game.data.name.toLowerCase().includes(query.toLowerCase()))

    const totalGames = filteredGames.length
    const totalPages = Math.ceil(totalGames / ITEMS_PER_PAGE)

    const paginatedGames = filteredGames.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

    return NextResponse.json({
      games: paginatedGames.map((game) => game.data),
      totalPages,
    });
  } catch (error) {
    console.error('Error reading or parsing juegos.json:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}