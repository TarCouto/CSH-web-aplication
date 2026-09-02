import { type Metadata } from 'next'

import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { PageIntro } from '@/components/PageIntro'
import { RootLayout } from '@/components/RootLayout'
import { AFTER_INTRO_Y } from '@/lib/spacing'

export const metadata: Metadata = {
  title: 'End User License Agreement',
  description:
    'License terms for digital boilerplate products purchased from Couto Software House.',
  alternates: { canonical: '/eula' },
}

export default function EulaPage() {
  return (
    <RootLayout>
      <PageIntro eyebrow="Legal" title="End User License Agreement">
        <p>
          These terms apply to all digital boilerplate products purchased from
          Couto Software House. By completing a purchase, you agree to this
          agreement.
        </p>
      </PageIntro>

      <Container className={AFTER_INTRO_Y}>
        <FadeIn>
          <div className="max-w-3xl space-y-10 text-base text-neutral-600">
            <section>
              <h2 className="font-display text-base font-semibold text-neutral-950">
                1. License grant
              </h2>
              <p className="mt-4">
                Upon payment, Couto Software House grants you a single-user,
                non-exclusive, non-transferable license to use the purchased
                digital product. This license is tied to the purchaser account
                that completed the transaction and may not be assigned or
                sublicensed.
              </p>
            </section>

            <section>
              <h2 className="font-display text-base font-semibold text-neutral-950">
                2. Permitted use
              </h2>
              <p className="mt-4">
                You may use the product in your own projects and in projects
                built for clients, including commercial work. You may modify
                the source code as needed for your implementation.
              </p>
            </section>

            <section>
              <h2 className="font-display text-base font-semibold text-neutral-950">
                3. Prohibited use
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5">
                <li>Redistributing, reselling, or relicensing the product</li>
                <li>
                  Sharing the source code, archive, or download links with
                  anyone who has not purchased a license
                </li>
                <li>
                  Publishing the product or substantial portions of it in public
                  repositories or marketplaces
                </li>
                <li>
                  Using the product to create a competing boilerplate or
                  template product for sale
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-base font-semibold text-neutral-950">
                4. Intellectual property
              </h2>
              <p className="mt-4">
                Couto Software House retains all ownership and intellectual
                property rights in the product. Your license grants use rights
                only; no ownership is transferred.
              </p>
            </section>

            <section>
              <h2 className="font-display text-base font-semibold text-neutral-950">
                5. Traceable copies
              </h2>
              <p className="mt-4">
                Each download includes a watermarked license file identifying
                the purchaser and license ID. Copies are traceable to the
                original buyer. Removing or altering the license file does not
                change your obligations under this agreement.
              </p>
            </section>

            <section>
              <h2 className="font-display text-base font-semibold text-neutral-950">
                6. Disclaimer of warranty
              </h2>
              <p className="mt-4">
                Products are provided &quot;as is&quot; without warranty of any
                kind, express or implied, including merchantability, fitness for
                a particular purpose, or non-infringement. We do not guarantee
                uninterrupted or error-free operation.
              </p>
            </section>

            <section>
              <h2 className="font-display text-base font-semibold text-neutral-950">
                7. Limitation of liability
              </h2>
              <p className="mt-4">
                To the maximum extent permitted by law, Couto Software House
                shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages, or for any loss of profits,
                data, or business opportunities arising from your use of the
                product. Our total liability shall not exceed the amount you
                paid for the product giving rise to the claim.
              </p>
            </section>

            <section>
              <h2 className="font-display text-base font-semibold text-neutral-950">
                8. Privacy and data retention
              </h2>
              <p className="mt-4">
                Every downloaded archive contains a{' '}
                <span className="font-semibold">LICENSE.txt</span> watermarked
                with the purchase email address and a unique license
                identifier. This lets us trace redistributed copies back to the
                account they came from, so treat the archive as personal to you.
              </p>
              <p className="mt-4">
                We log each download — the account, the product, the timestamp,
                the IP address and the browser user agent — to detect licence
                abuse. IP addresses and user agents are erased 30 days after the
                download, and the remaining log entry is deleted after 180 days.
                Deleting your account removes your download history along with
                it. Requests regarding your personal data may be sent to the
                address below.
              </p>
            </section>

            <section>
              <h2 className="font-display text-base font-semibold text-neutral-950">
                9. Contact
              </h2>
              <p className="mt-4">
                Questions about this agreement or licensing may be sent to{' '}
                <a
                  href="mailto:support@couto.software"
                  className="text-neutral-950 underline"
                >
                  support@couto.software
                </a>
                .
              </p>
            </section>
          </div>
        </FadeIn>
      </Container>
    </RootLayout>
  )
}
