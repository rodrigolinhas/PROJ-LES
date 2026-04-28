/*
 * Footer da landing page — layout centralizado e limpo.
 * Logo + descrição no topo, links horizontais, copyright em baixo.
 */

export default function Footer() {
    return (
        <footer id="contact" className="bg-white border-t border-gray-100">
            <div className="border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-center">
                    <p className="text-xs text-gray-400">
                        © {new Date().getFullYear()} SciEvents. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}