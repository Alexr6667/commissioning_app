import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'

function App() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Commissioning App</CardTitle>
          <CardDescription>
            Project scaffold is ready. Features will be added in later steps.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Input placeholder="Placeholder input" readOnly />
          <Button type="button">Placeholder button</Button>
        </CardContent>
      </Card>
    </main>
  )
}

export default App
