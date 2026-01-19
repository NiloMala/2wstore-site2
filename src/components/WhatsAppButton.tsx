export const WhatsAppButton = () => {
  const phoneNumber = "5511999999999"; // Número do WhatsApp
  const message = "Olá! Gostaria de saber mais sobre os produtos.";
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 md:bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      aria-label="Contato via WhatsApp"
    >
      <svg 
        viewBox="0 0 32 32" 
        className="w-8 h-8 fill-white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M16.002 3.2c-7.066 0-12.8 5.734-12.8 12.8 0 2.254.586 4.454 1.698 6.4l-1.778 6.4 6.57-1.724a12.736 12.736 0 0 0 6.31 1.67c7.066 0 12.8-5.734 12.8-12.8s-5.734-12.746-12.8-12.746zm0 23.2a10.346 10.346 0 0 1-5.578-1.624l-.4-.236-4.138 1.086 1.104-4.034-.26-.412a10.328 10.328 0 0 1-1.584-5.534c0-5.724 4.66-10.4 10.388-10.4 5.724 0 10.388 4.676 10.388 10.4s-4.66 10.754-10.388 10.754h-.532zm5.698-7.776c-.312-.156-1.85-.912-2.136-1.016-.286-.104-.494-.156-.702.156s-.806 1.016-.988 1.224c-.182.208-.364.234-.676.078-.312-.156-1.318-.486-2.51-1.55-.928-.828-1.554-1.85-1.736-2.162-.182-.312-.02-.48.136-.636.142-.14.312-.364.468-.546.156-.182.208-.312.312-.52.104-.208.052-.39-.026-.546-.078-.156-.702-1.694-.962-2.318-.254-.61-.512-.528-.702-.538l-.598-.01c-.208 0-.546.078-.832.39-.286.312-1.092 1.068-1.092 2.604s1.118 3.022 1.274 3.23c.156.208 2.2 3.36 5.33 4.712.744.32 1.326.512 1.778.656.748.238 1.428.204 1.966.124.6-.09 1.85-.756 2.11-1.486.26-.73.26-1.356.182-1.486-.078-.13-.286-.208-.598-.364z"/>
      </svg>
    </a>
  );
};
