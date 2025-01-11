export function MetaIcons() {
  return (
    <>
      {/* Standard favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      
      {/* Apple Touch Icons */}
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
      
      {/* Android/Chrome Icons */}
      <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
      <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.png" />
      
      {/* Web Manifest */}
      <link rel="manifest" href="/manifest.json" />
      
      {/* Safari Pinned Tab */}
      <link rel="mask-icon" href="/favicon.ico" color="#000000" />
      
      {/* MS Tile Color */}
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="theme-color" content="#000000" />
    </>
  );
} 