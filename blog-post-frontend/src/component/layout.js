import React from "react";
import NavBar from "./navbar";

function Layout({ children }) {
    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <>
            <NavBar user={user} />
            <main>{children}</main>
        </>
    );
}

export default Layout;
