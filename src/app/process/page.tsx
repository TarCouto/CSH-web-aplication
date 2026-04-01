import { type Metadata } from 'next'

import { Blockquote } from '@/components/Blockquote'
import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { GridList, GridListItem } from '@/components/GridList'
import { List, ListItem } from '@/components/List'
import { PageIntro } from '@/components/PageIntro'
import { SectionIntro } from '@/components/SectionIntro'
import { StylizedImage } from '@/components/StylizedImage'
import { TagList, TagListItem } from '@/components/TagList'
import imageLaptop from '@/images/laptop.jpg'
import imageMeeting from '@/images/meeting.jpg'
import imageWhiteboard from '@/images/whiteboard.jpg'
import { RootLayout } from '@/components/RootLayout'

function Section({
  title,
  image,
  children,
}: {
  title: string
  image: React.ComponentPropsWithoutRef<typeof StylizedImage>
  children: React.ReactNode
}) {
  return (
    <Container className="group/section [counter-increment:section]">
      <div className="lg:flex lg:items-center lg:justify-end lg:gap-x-8 lg:group-even/section:justify-start xl:gap-x-20">
        <div className="flex justify-center">
          <FadeIn className="w-135 flex-none lg:w-180">
            <StylizedImage
              {...image}
              sizes="(min-width: 1024px) 41rem, 31rem"
              className="justify-center lg:justify-end lg:group-even/section:justify-start"
            />
          </FadeIn>
        </div>
        <div className="mt-12 lg:mt-0 lg:w-148 lg:flex-none lg:group-even/section:order-first">
          <FadeIn>
            <div
              className="font-display text-base font-semibold before:text-neutral-300 before:content-['/_'] after:text-neutral-950 after:content-[counter(section,decimal-leading-zero)]"
              aria-hidden="true"
            />
            <h2 className="mt-2 font-display text-3xl font-medium tracking-tight text-neutral-950 sm:text-4xl">
              {title}
            </h2>
            <div className="mt-6">{children}</div>
          </FadeIn>
        </div>
      </div>
    </Container>
  )
}

function Discover() {
  return (
    <Section title="Discover" image={{ src: imageWhiteboard }}>
      <div className="space-y-6 text-base text-neutral-600">
        <p>
          We start by deeply understanding your{' '}
          <strong className="font-semibold text-neutral-950">business goals</strong>,
          target audience, and technical requirements. This ensures every
          decision we make is aligned with your objectives.
        </p>
        <p>
          We analyze your existing{' '}
          <strong className="font-semibold text-neutral-950">tech stack</strong>,
          identify bottlenecks, and evaluate the best architecture for your
          needs — whether that means a React SPA, a Next.js SSR application,
          or a headless CMS integration.
        </p>
        <p>
          The discovery phase concludes with a detailed{' '}
          <strong className="font-semibold text-neutral-950">technical roadmap</strong>,
          timeline, and clear deliverables so you know exactly what to expect.
        </p>
      </div>

      <h3 className="mt-12 font-display text-base font-semibold text-neutral-950">
        Included in this phase
      </h3>
      <TagList className="mt-4">
        <TagListItem>Requirements gathering</TagListItem>
        <TagListItem>Technical audit</TagListItem>
        <TagListItem>Architecture design</TagListItem>
        <TagListItem>User flow mapping</TagListItem>
        <TagListItem>Proof of concept</TagListItem>
        <TagListItem>Project roadmap</TagListItem>
      </TagList>
    </Section>
  )
}

function Build() {
  return (
    <Section title="Build" image={{ src: imageLaptop, shape: 1 }}>
      <div className="space-y-6 text-base text-neutral-600">
        <p>
          With the roadmap in place, our engineering team begins building your
          application using modern frameworks like React, Next.js, or Angular
          with TypeScript — following best practices for performance and
          maintainability.
        </p>
        <p>
          We work in iterative sprints with regular demos, keeping you involved
          throughout the development process. Every feature is built with
          component architecture, tested thoroughly, and optimized for speed.
        </p>
        <p>
          CI/CD pipelines are configured from day one using Vercel and GitHub
          Actions, ensuring seamless deployments and rapid feedback cycles
          throughout the entire build phase.
        </p>
      </div>

      <Blockquote
        author={{ name: 'Debra Fiscal', role: 'CEO of Unseal' }}
        className="mt-12"
      >
        The team at CSH kept us informed at every step. Their development
        velocity and code quality were outstanding.
      </Blockquote>
    </Section>
  )
}

function Deliver() {
  return (
    <Section title="Deliver" image={{ src: imageMeeting, shape: 2 }}>
      <div className="space-y-6 text-base text-neutral-600">
        <p>
          Before launch, we run comprehensive{' '}
          <strong className="font-semibold text-neutral-950">
            performance audits
          </strong>
          , ensuring your application scores high on Core Web Vitals and
          delivers an exceptional user experience across all devices.
        </p>
        <p>
          We handle the complete{' '}
          <strong className="font-semibold text-neutral-950">deployment</strong>{' '}
          pipeline — from staging environments to production, with automated
          testing, preview deployments, and monitoring configured out of the box.
        </p>
        <p>
          After launch, we provide ongoing{' '}
          <strong className="font-semibold text-neutral-950">
            support and optimization
          </strong>
          , monitoring performance metrics and implementing improvements to keep
          your application running at peak{' '}
          <strong className="font-semibold text-neutral-950">
            performance
          </strong>
          .
        </p>
      </div>

      <h3 className="mt-12 font-display text-base font-semibold text-neutral-950">
        Included in this phase
      </h3>
      <List className="mt-8">
        <ListItem title="Testing">
          Comprehensive testing including unit tests, integration tests, and
          end-to-end tests to ensure reliability at every level.
        </ListItem>
        <ListItem title="Infrastructure">
          Production-grade deployments on Vercel with edge functions, CDN
          distribution, and automatic scaling for traffic spikes.
        </ListItem>
        <ListItem title="Support">
          Post-launch monitoring, performance optimization, and ongoing
          maintenance to keep your application running smoothly.
        </ListItem>
      </List>
    </Section>
  )
}

function Values() {
  return (
    <div className="relative mt-24 pt-24 sm:mt-32 sm:pt-32 lg:mt-40 lg:pt-40">
      <div className="absolute inset-x-0 top-0 -z-10 h-[884px] overflow-hidden rounded-t-4xl bg-linear-to-b from-neutral-50" />

      <SectionIntro
        eyebrow="Our values"
        title="Balancing reliability and innovation"
      >
        <p>
          We stay at the forefront of modern web technologies while maintaining
          proven engineering practices. Our values guide every decision we make.
        </p>
      </SectionIntro>

      <Container className="mt-24">
        <GridList>
          <GridListItem title="Performance-first">
            Every line of code is written with performance in mind. We optimize
            for Core Web Vitals, fast load times, and smooth interactions.
          </GridListItem>
          <GridListItem title="Efficient">
            We ship fast without cutting corners. Modern tooling, automated
            pipelines, and clean architecture keep us moving at velocity.
          </GridListItem>
          <GridListItem title="Adaptable">
            Every business has unique needs. We tailor our tech stack and
            approach to match your specific requirements and constraints.
          </GridListItem>
          <GridListItem title="Transparent">
            Clear communication, honest timelines, and detailed documentation.
            You always know where your project stands.
          </GridListItem>
          <GridListItem title="Reliable">
            We build long-term partnerships with our clients, providing ongoing
            support and proactive optimization after launch.
          </GridListItem>
          <GridListItem title="Innovative">
            We leverage cutting-edge technologies like React Server Components,
            edge computing, and headless architectures to deliver the best results.
          </GridListItem>
        </GridList>
      </Container>
    </div>
  )
}

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Our Process',
  description:
    'Our proven development process ensures every project is delivered on time, on budget, and built to perform.',
}

export default function Process() {
  return (
    <RootLayout>
      <PageIntro eyebrow="Our process" title="How we work">
        <p>
          We follow a structured, transparent process that keeps you informed
          at every stage — from discovery to deployment and beyond.
        </p>
      </PageIntro>

      <div className="mt-24 space-y-24 [counter-reset:section] sm:mt-32 sm:space-y-32 lg:mt-40 lg:space-y-40">
        <Discover />
        <Build />
        <Deliver />
      </div>

      <Values />

      <ContactSection />
    </RootLayout>
  )
}
