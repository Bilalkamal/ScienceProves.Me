import Image from 'next/image';

export function FooterLinks() {
  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Image
            src="/icons/icon-192.png"
            alt="ScienceProves.me Logo"
            width={24}
            height={24}
            className="text-primary"
          />
          <span className="text-lg font-bold">ScienceProves.me</span>
        </div>
        <p className="text-muted-foreground">
          Empowering decisions with scientific evidence.
        </p>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Product</h3>
        <ul className="space-y-2">
          <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
          <li><a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a></li>
          <li><a href="#demo" className="text-muted-foreground hover:text-foreground transition-colors">Demo</a></li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Company</h3>
        <ul className="space-y-2">
          <li><a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a></li>
          <li><a href="#careers" className="text-muted-foreground hover:text-foreground transition-colors">Careers</a></li>
          <li><a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
        </ul>
      </div>
    </>
  );
}