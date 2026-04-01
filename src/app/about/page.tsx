import { type Metadata } from 'next'

import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { GridList, GridListItem } from '@/components/GridList'
import { PageIntro } from '@/components/PageIntro'
import { PageLinks } from '@/components/PageLinks'
import { SectionIntro } from '@/components/SectionIntro'
import { StatList, StatListItem } from '@/components/StatList'
import { loadArticles } from '@/lib/mdx'
import { RootLayout } from '@/components/RootLayout'

function Culture() {
  return (
    <div className="mt-24 rounded-4xl bg-neutral-950 py-24 sm:mt-32 lg:mt-40 lg:py-32">
      <SectionIntro
        eyebrow="Our culture"
        title="Performance-driven, people-first."
        invert
      >
        <p>
          We are engineers who care deeply about code quality, user experience,
          and delivering measurable results.
        </p>
      </SectionIntro>
      <Container className="mt-16">
        <GridList>
          <GridListItem title="Quality" invert>
            We write clean, tested, and maintainable code. Every component is
            built with performance and accessibility in mind.
          </GridListItem>
          <GridListItem title="Transparency" invert>
            Clear communication, honest timelines, and regular progress updates.
            You always know exactly where your project stands.
          </GridListItem>
          <GridListItem title="Ownership" invert>
            We treat every project as our own. From architecture decisions to
            pixel-perfect implementation, we take full responsibility.
          </GridListItem>
        </GridList>
      </Container>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Couto Software House is a Brazilian software engineering company with 4+ years of experience building high-performance web applications.',
}

export default async function About() {
  let blogArticles = (await loadArticles()).slice(0, 2)

  return (
    <RootLayout>
      <PageIntro eyebrow="About us" title="Engineering excellence from Brazil">
        <p>
          With 4+ years of hands-on experience, we help businesses build fast,
          modern, and conversion-focused digital products.
        </p>
        <div className="mt-10 max-w-2xl space-y-6 text-base">
          <p>
            Couto Software House was founded with a clear mission: deliver
            high-performance web applications that drive real business results.
            We specialize in React, Next.js, Angular, and TypeScript — building
            everything from complex SPAs to high-converting landing pages.
          </p>
          <p>
            Based in São Paulo and delivering globally, we work with agencies,
            mid-sized companies, and SaaS products that need reliable, scalable
            frontend engineering. Our team brings deep expertise in modern web
            technologies and a performance-first mindset to every project.
          </p>
        </div>
      </PageIntro>
      <Container className="mt-16">
        <StatList>
          <StatListItem value="4+" label="Years of experience" />
          <StatListItem value="50+" label="Projects delivered" />
          <StatListItem value="100%" label="Client satisfaction" />
        </StatList>
      </Container>

      <Culture />

      <PageLinks
        className="mt-24 sm:mt-32 lg:mt-40"
        title="From the blog"
        intro="Our team of experienced designers and developers has just one thing on their mind; working on your ideas to draw a smile on the face of your users worldwide. From conducting Brand Sprints to UX Design."
        pages={blogArticles}
      />

      <ContactSection />
    </RootLayout>
  )
}
