const logos = [
  // Research Repositories
  {
    name: 'ArXiv',
    url: '/logos/arxiv-logo.svg',
    className: 'h-8 w-auto'
  },
  {
    name: 'Nature',
    url: '/logos/nature-logo.svg',
    className: 'h-7 w-auto'
  },
  {
    name: 'BioRxiv',
    url: '/logos/biorxiv-logo.svg',
    className: 'h-8 w-auto'
  },
  {
    name: 'SSRN',
    url: '/logos/ssrn-logo.svg',
    className: 'h-6 w-auto'
  },
  // Top Universities & Research Institutions
  {
    name: 'MIT',
    url: '/logos/mit-logo.svg',
    className: 'h-10 w-auto'
  },
  {
    name: 'Oxford',
    url: '/logos/oxford-logo.svg',
    className: 'h-10 w-auto'
  },
  {
    name: 'Caltech',
    url: '/logos/caltech-logo.svg',
    className: 'h-8 w-auto'
  },

  {
    name: 'UCL',
    url: '/logos/ucl-logo.svg',
    className: 'h-8 w-auto'
  },
  {
    name: 'CERN',
    url: '/logos/cern-logo.svg',
    className: 'h-7 w-auto'
  },
  {
    name: 'Imperial College',
    url: '/logos/imperial-logo.svg',
    className: 'h-8 w-auto'
  },
  {
    name: 'Georgia Tech',
    url: '/logos/georgia-tech-logo.svg',
    className: 'h-8 w-auto'
  },
  {
    name: 'Kyoto University',
    url: '/logos/kyoto-logo.svg',
    className: 'h-9 w-auto'
  },
  {
    name: 'ETH Zürich',
    url: '/logos/eth-logo.svg',
    className: 'h-8 w-auto'
  },
]

const AnimatedLogoCloud = () => {
  return (
    <div className="w-full py-8">
      <div className="mx-auto w-full px-4 md:px-8">
        <div
          className="relative mt-4 flex gap-8 overflow-hidden"
          style={{
            maskImage:
              'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
          }}
        >
          {Array(2)
            .fill(null)
            .map((_, index) => (
              <div
                key={index}
                className="flex shrink-0 animate-logo-cloud flex-row items-center justify-around gap-8"
              >
                {logos.map((logo) => (
                  <div
                    key={logo.name}
                    className="flex items-center justify-center px-4"
                  >
                    <img
                      src={logo.url}
                      className={`${logo.className} object-contain brightness-0 dark:invert opacity-80 hover:opacity-100 transition-opacity`}
                      alt={`${logo.name} logo`}
                    />
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default AnimatedLogoCloud 