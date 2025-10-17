import s from "./Footer.module.css";

export default function Footer() {
    return (
        <footer className={s.footer}>
            © {new Date().getFullYear()} CompassAI
        </footer>
    );
}
