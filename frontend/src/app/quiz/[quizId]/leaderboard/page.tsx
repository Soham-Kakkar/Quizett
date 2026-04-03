

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getLeaderboardApi } from '@/lib/api'

export default async function LeaderboardPage({ params }: { params: Promise<{ quizId: string }> | { quizId: string } }) {
	const resolved = await params
	const { quizId } = resolved

	let entries: Array<{ username: string; rawScore: number; normalized: number; date: string }> = []
	try {
		const data = await getLeaderboardApi(quizId)
		entries = data.entries || []
	} catch {
		return <div className="text-red-600 py-8">Failed to load leaderboard</div>
	}

	return (
		<div className="p-8">
			<h2 className="text-2xl font-semibold mb-4">Leaderboard</h2>
			<Card>
				<CardHeader>
					<CardTitle>Top Scores</CardTitle>
				</CardHeader>
				<CardContent>
					{entries.length === 0 ? (
						<div className="p-4">No entries yet.</div>
					) : (
						<ol className="list-decimal p-6">
							{entries.map((e) => (
								<li key={`${e.username}-${e.date}`} className="py-2">
									<div className="flex justify-between">
										<div>
											<div className="font-medium">{e.username}</div>
											<div className="text-sm text-muted-foreground">{new Date(e.date).toLocaleString()}</div>
										</div>
													<div className="text-right">
														<div className="text-lg font-semibold">{e.rawScore}</div>
														<div className="text-sm text-muted-foreground">norm: {e.normalized}</div>
													</div>
									</div>
								</li>
							))}
						</ol>
					)}
				</CardContent>
			</Card>

			<div className="mt-6">
				<a className="px-4 py-2 rounded bg-muted text-foreground" href={`/quiz`}>Back to home</a>
			</div>
		</div>
	)
}

