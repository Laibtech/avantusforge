"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function TechnologySection() {
  return (
    <section className="af-tech-section">
      <div className="af-tech-container">

        {/* SECTION HEADER */}
        <div className="af-tech-header">
          <div>
            <span className="af-tech-eyebrow">TECHNOLOGY STACK</span>

            <h2>
              Built with the<br />
              right technology.
            </h2>
          </div>

          <p>
            We use modern, reliable technologies to build fast,
            scalable and future-ready digital solutions.
          </p>
        </div>


        {/* TECHNOLOGY GRID */}
        <div className="af-tech-grid">


          {/* 01 FRONTEND */}
          <article className="af-tech-card af-tech-card--light">

            <div className="af-tech-card-top">
              <div>
                <span className="af-tech-number">01</span>
                <span className="af-tech-line"></span>
              </div>

              <div className="af-tech-icon">
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="M7 8l3 3-3 3" />
                  <path d="M12 14h5" />
                </svg>
              </div>
            </div>

            <span className="af-tech-label">FRONTEND &amp; WEB</span>

            <h3>
              Modern, responsive
              web experiences.
            </h3>

            <p>
              We build fast, accessible and scalable frontends
              that look great and perform across all devices.
            </p>

            <div className="af-tech-tags">
              <span>Next.js</span>
              <span>React</span>
              <span>TypeScript</span>
              <span>Tailwind CSS</span>
              <span>HTML5</span>
              <span>Modern JavaScript</span>
            </div>

            <Link href="/services/web-development" className="af-tech-link">
              EXPLORE FRONTEND
              <span>&rarr;</span>
            </Link>

            <div className="af-tech-rings af-tech-rings--right"></div>

          </article>


          {/* 02 BACKEND FEATURED */}
          <article className="af-tech-card af-tech-card--burgundy">

            <div className="af-tech-card-top">
              <div>
                <span className="af-tech-number">02</span>
                <span className="af-tech-line"></span>
              </div>

              <div className="af-tech-icon">
                <svg viewBox="0 0 24 24">
                  <rect x="4" y="4" width="16" height="5" rx="1" />
                  <rect x="4" y="10" width="16" height="5" rx="1" />
                  <rect x="4" y="16" width="16" height="5" rx="1" />
                  <path d="M8 6.5h.01M8 12.5h.01M8 18.5h.01" />
                </svg>
              </div>
            </div>

            <span className="af-tech-label">BACKEND &amp; SYSTEMS</span>

            <h3>
              Powerful backend
              for complex systems.
            </h3>

            <p>
              We create secure, scalable and efficient backend
              solutions that handle your business logic and data.
            </p>

            <div className="af-tech-tags">
              <span>Node.js</span>
              <span>PHP</span>
              <span>Laravel</span>
              <span>REST APIs</span>
              <span>GraphQL</span>
              <span>Serverless Functions</span>
            </div>

            <Link href="/services/custom-software-development" className="af-tech-link">
              EXPLORE BACKEND
              <span>&rarr;</span>
            </Link>

            <div className="af-tech-burgundy-shape"></div>

          </article>


          {/* 03 DATABASE */}
          <article className="af-tech-card af-tech-card--light">

            <div className="af-tech-card-top">
              <div>
                <span className="af-tech-number">03</span>
                <span className="af-tech-line"></span>
              </div>

              <div className="af-tech-icon">
                <svg viewBox="0 0 24 24">
                  <ellipse cx="12" cy="5" rx="7" ry="3" />
                  <path d="M5 5v7c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
                  <path d="M5 12v7c0 1.7 3.1 3 7 3s7-1.3 7-3v-7" />
                </svg>
              </div>
            </div>

            <span className="af-tech-label">DATABASES &amp; ORMS</span>

            <h3>
              Reliable data,
              better decisions.
            </h3>

            <p>
              We design and manage databases that are secure,
              optimized and built for performance.
            </p>

            <div className="af-tech-tags">
              <span>PostgreSQL</span>
              <span>MySQL</span>
              <span>Prisma</span>
              <span>Redis</span>
              <span>Database Migrations</span>
            </div>

            <Link href="/services/custom-software-development" className="af-tech-link">
              EXPLORE DATABASES
              <span>&rarr;</span>
            </Link>

            <div className="af-tech-rings af-tech-rings--bottom"></div>

          </article>


          {/* 04 ECOMMERCE WIDE */}
          <article className="af-tech-card af-tech-card--wide">

            <div className="af-tech-wide-content">

              <div className="af-tech-card-top">
                <div>
                  <span className="af-tech-number">04</span>
                  <span className="af-tech-line"></span>
                </div>

                <div className="af-tech-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M4 5h2l2 10h9l3-7H7" />
                    <circle cx="10" cy="19" r="1.5" />
                    <circle cx="17" cy="19" r="1.5" />
                  </svg>
                </div>
              </div>

              <span className="af-tech-label">ECOMMERCE &amp; CMS</span>

              <h3>
                Scale your online business.
              </h3>

              <p>
                We build powerful eCommerce platforms and
                flexible CMS solutions that help you sell,
                grow and manage with ease.
              </p>

              <div className="af-tech-tags">
                <span>Shopify Plus</span>
                <span>Liquid 2.0</span>
                <span>WordPress</span>
                <span>WooCommerce</span>
                <span>Headless CMS</span>
              </div>

              <Link href="/services/ecommerce-development" className="af-tech-link">
                EXPLORE ECOMMERCE
                <span>&rarr;</span>
              </Link>

            </div>

            <div className="af-tech-wide-visual group">

              <div className="af-tech-visual-circle"></div>

              <div className="af-tech-image-container relative w-full h-full min-h-[360px] flex items-center justify-center p-4 sm:p-6">
                <Image
                  src="/images/ecommerce-tech-card.png"
                  alt="AvantusForge eCommerce & CMS Solutions - Shopify, WooCommerce, Headless CMS"
                  fill
                  className="object-contain object-center transition-transform duration-700 ease-out group-hover:scale-105 drop-shadow-[0_20px_40px_rgba(117,15,44,0.18)]"
                  sizes="(max-width: 1024px) 100vw, 550px"
                  priority
                />
              </div>

            </div>

          </article>


          {/* 05 CLOUD WIDE */}
          <article className="af-tech-card af-tech-card--cloud">

            <div className="af-tech-card-top">
              <div>
                <span className="af-tech-number">05</span>
                <span className="af-tech-line"></span>
              </div>

              <div className="af-tech-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6 11a3.5 3.5 0 0 0 1 7Z" />
                  <path d="M12 10v7" />
                  <path d="m9 13 3-3 3 3" />
                </svg>
              </div>
            </div>

            <span className="af-tech-label">CLOUD &amp; RELIABILITY</span>

            <h3>
              Built for performance
              and uptime.
            </h3>

            <p>
              We use modern cloud infrastructure and best
              practices to keep your systems fast, secure
              and always on.
            </p>

            <div className="af-tech-tags">
              <span>Vercel Edge</span>
              <span>AWS</span>
              <span>Docker</span>
              <span>CI/CD Pipelines</span>
              <span>SSL &amp; DNS</span>
            </div>

            <Link href="/services/business-automation" className="af-tech-link">
              EXPLORE CLOUD
              <span>&rarr;</span>
            </Link>

            <div className="af-tech-dots"></div>
            <div className="af-tech-cloud-shape"></div>

          </article>


        </div>
      </div>
    </section>
  );
}
