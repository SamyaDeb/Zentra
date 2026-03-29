/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      '@react-native-async-storage/async-storage': false,
      'react-native': false,
      'react-native-randombytes': false,
    };
    config.externals.push('pino-pretty', 'lokijs', 'encoding', '@coinbase/cdp-sdk', '@base-org/account');
    return config;
  },
};

module.exports = nextConfig;
