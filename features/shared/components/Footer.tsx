export default function Footer() {
    return (
        <footer className=" text-white py-4">
            <div className="container mx-auto px-4">
                <p className="text-center">
                    &copy; {new Date().getFullYear()} Gacha Machine. All rights reserved.
                </p>
            </div>
        </footer>
    )
}