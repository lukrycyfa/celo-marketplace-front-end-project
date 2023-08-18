import { FC, ReactNode } from "react";
import Footer from "./Footer";
import Header from "./Header";

interface Props {
    children: ReactNode;
}
const Layout: FC<Props> = ({ children }) => {
    return (
        <>
            <div className="bg-gypsum overflow-hidden dark:bg-slate-800 dark:border-slate-500 flex flex-col min-h-screen">
                <Header />
                <div className="py-16 max-w-7xl  mx-auto space-y-8 sm:px-6 lg:px-8">
                    {children}
                </div>
                <Footer />
            </div>
        </>
    );
};

export default Layout;
