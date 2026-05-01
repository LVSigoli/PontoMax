import { Typography } from "@/components/structure/Typography"

interface Props {
  title: string
  subtitle: string
}

export const PlaceholderPage: React.FC<Props> = ({ title, subtitle }) => {
  return (
    <section className="flex min-h-screen items-center justify-center bg-surface-page px-6 py-10">
      <div className="max-w-xl rounded-2xl border border-border-subtle bg-surface-card px-8 py-10 text-center shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
        <Typography variant="h3" value={title} />
        <Typography
          variant="b1"
          value={subtitle}
          className="mt-3 text-content-secondary"
        />
      </div>
    </section>
  )
}
