/** @type {import('next').NextConfig} */
const isGithubPages = process.env.DEPLOY_TARGET === 'github-pages'

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: isGithubPages ? '/webtimerapp' : '',
  images: {
    unoptimized: true,
  },
}
module.exports = nextConfig
