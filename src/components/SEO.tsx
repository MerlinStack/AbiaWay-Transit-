import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image }) => {
  const siteTitle = 'AbiaWay Transit';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const defaultDescription = 'Smart transit system for Abia State. Real-time bus tracking, digital payments, and route planning.';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || '/og-image.png'} />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
};

export default SEO;