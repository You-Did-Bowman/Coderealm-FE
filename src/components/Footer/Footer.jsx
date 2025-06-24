import "./_footer.scss";

function Footer() {
  const isChatActive =
    typeof document !== "undefined" &&
    document.body.classList.contains("chat-active");

  if (isChatActive) return null;

  return (
    <>
      <footer className="">
       <a href ="https://github.com/Ahmad-al-sayedd"><i class="fa-brands fa-github"></i>Ahmad Al Sayed</a>
       <a href="https://github.com/AndyZekaj"><i class="fa-brands fa-github"></i>Avdyl Zekaj</a>
       <a href="https://github.com/divyasheen"><i class="fa-brands fa-github"></i>Divya Sheen</a>
       <a href="https://github.com/You-Did-Bowman"><i class="fa-brands fa-github"></i>Judith Bohmann</a>



      </footer>
    </>
  );
}

export default Footer;
