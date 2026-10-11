import logo from '../../../assets/FrancoPerfumeLogo.png';

const MobileBlocker = () => {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-8 text-center font-montserrat">
      <img src={logo} alt="Franco's Logo" className="h-32 w-auto object-contain mb-4" />
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-12 tracking-tight">
        OneFrancoScentHub
      </h1>
      <div className="flex flex-col gap-6 text-muted-foreground text-lg md:text-xl font-medium max-w-sm">
        <p>
          Please use a device with<br />a bigger resolution.
        </p>
        <p>
          This website will not work<br />on a mobile device.
        </p>
      </div>
    </div>
  );
};

export default MobileBlocker;