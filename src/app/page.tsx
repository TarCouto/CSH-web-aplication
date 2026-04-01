import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { ContactSection } from '@/components/ContactSection'
import { Container } from '@/components/Container'
import { FadeIn, FadeInStagger } from '@/components/FadeIn'
import { List, ListItem } from '@/components/List'
import { SectionIntro } from '@/components/SectionIntro'
import { StylizedImage } from '@/components/StylizedImage'
import { Testimonial } from '@/components/Testimonial'
import logoGreenLifeDark from '@/images/clients/green-life/logo-dark.svg'
import { StatList, StatListItem } from '@/components/StatList'
import imageLaptop from '@/images/laptop.jpg'
import { type CaseStudy, type MDXEntry, loadCaseStudies } from '@/lib/mdx'
import { RootLayout } from '@/components/RootLayout'

function Results() {
  return (
    <div className="mt-24 rounded-4xl bg-neutral-950 py-20 sm:mt-32 sm:py-32 lg:mt-56">
      <Container>
        <FadeIn>
          <h2 className="font-display text-2xl font-semibold text-white">
            Results that speak for themselves
          </h2>
          <p className="mt-4 text-lg text-neutral-400">
            We focus on delivering measurable impact — faster load times,
            higher conversion rates, and scalable architectures.
          </p>
        </FadeIn>
        <div className="mt-16">
          <StatList>
            <StatListItem invert value="50+" label="Projects delivered" />
            <StatListItem invert value="98%" label="Client satisfaction" />
            <StatListItem invert value="<1s" label="Average load time" />
            <StatListItem invert value="3x" label="Conversion increase" />
          </StatList>
        </div>
      </Container>
    </div>
  )
}

function CaseStudies({
  caseStudies,
}: {
  caseStudies: Array<MDXEntry<CaseStudy>>
}) {
  return (
    <>
      <SectionIntro
        title="Building digital products that drive real results"
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p>
          We combine deep frontend expertise with a performance-first mindset
          to deliver web applications that convert visitors into customers.
        </p>
      </SectionIntro>
      <Container className="mt-16">
        <FadeInStagger className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {caseStudies.map((caseStudy) => (
            <FadeIn key={caseStudy.href} className="flex">
              <article className="relative flex w-full flex-col rounded-3xl p-6 ring-1 ring-neutral-950/5 transition hover:bg-neutral-50 sm:p-8">
                <h3>
                  <Link href={caseStudy.href}>
                    <span className="absolute inset-0 rounded-3xl" />
                    <Image
                      src={caseStudy.logo}
                      alt={caseStudy.client}
                      className="h-16 w-16"
                      unoptimized
                    />
                  </Link>
                </h3>
                <p className="mt-6 flex gap-x-2 text-sm text-neutral-950">
                  <time
                    dateTime={caseStudy.date.split('-')[0]}
                    className="font-semibold"
                  >
                    {caseStudy.date.split('-')[0]}
                  </time>
                  <span className="text-neutral-300" aria-hidden="true">
                    /
                  </span>
                  <span>Case study</span>
                </p>
                <p className="mt-6 font-display text-2xl font-semibold text-neutral-950">
                  {caseStudy.title}
                </p>
                <p className="mt-4 text-base text-neutral-600">
                  {caseStudy.description}
                </p>
              </article>
            </FadeIn>
          ))}
        </FadeInStagger>
      </Container>
    </>
  )
}

function Services() {
  return (
    <>
      <SectionIntro
        eyebrow="Services"
        title="We help you build fast, modern, and scalable web applications."
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p>
          From high-converting landing pages to complex single page applications,
          we deliver production-ready solutions that perform at scale.
        </p>
      </SectionIntro>
      <Container className="mt-16">
        <div className="lg:flex lg:items-center lg:justify-end">
          <div className="flex justify-center lg:w-1/2 lg:justify-end lg:pr-12">
            <FadeIn className="w-135 flex-none lg:w-180">
              <StylizedImage
                src={imageLaptop}
                sizes="(min-width: 1024px) 41rem, 31rem"
                className="justify-center lg:justify-end"
                priority
              />
            </FadeIn>
          </div>
          <List className="mt-16 lg:mt-0 lg:w-1/2 lg:min-w-132 lg:pl-4">
            <ListItem title="Single Page Applications">
              We build high-performance SPAs with Angular, React, and Next.js
              — delivering fast, interactive experiences that keep users engaged.
            </ListItem>
            <ListItem title="Landing Pages & SSR">
              High-converting landing pages built with server-side rendering
              and incremental static regeneration for maximum performance and SEO.
            </ListItem>
            <ListItem title="Dashboards & Admin Panels">
              Analytical dashboards and admin panels with real-time data
              visualization, role-based access, and intuitive interfaces.
            </ListItem>
            <ListItem title="Headless CMS & API Integration">
              Seamless integrations with Strapi, Sanity, REST APIs, and JWT
              authentication — giving you full control over your content.
            </ListItem>
          </List>
        </div>
      </Container>
    </>
  )
}

export const dynamic = 'force-static'

export const metadata: Metadata = {
  description:
    'Couto Software House — Brazilian software engineering company specializing in high-performance web applications.',
}

export default async function Home() {
  let caseStudies = (await loadCaseStudies()).slice(0, 3)

  return (
    <RootLayout>
      <Container className="mt-24 sm:mt-32 md:mt-56">
        <div className="max-w-3xl">
          <h1 className="font-display text-3xl font-medium tracking-tight text-balance text-neutral-950 sm:text-5xl lg:text-7xl">
            High-performance web applications built in Brazil, delivered globally.
          </h1>
          <p className="mt-6 text-xl text-neutral-600">
            We are a software engineering company specializing in fast, modern,
            and conversion-focused digital products — from complex SPAs to
            high-converting landing pages.
          </p>
        </div>
      </Container>

      <Results />

      <CaseStudies caseStudies={caseStudies} />

      <Testimonial
        className="mt-24 sm:mt-32 lg:mt-40"
        client={{ name: 'CSH', logo: logoGreenLifeDark }}
      >
        Couto Software House delivered a blazing-fast web application that
        exceeded our performance targets. Their expertise in Angular, React,
        and Next.js made all the difference.
      </Testimonial>

      <Services />

      <ContactSection />
    </RootLayout>
  )
}
