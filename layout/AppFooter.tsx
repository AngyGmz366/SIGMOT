/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import { LayoutContext } from './context/layoutcontext';

const AppFooter = () => {
    const { layoutConfig } = useContext(LayoutContext);

   return (
        <div className="layout-footer">
            <div className="layout-footer-content">
                <span className="footer-text">
                    &copy; {new Date().getFullYear()} SIGMOT. Todos los derechos reservados. 
                </span>
                
            </div>
        </div>
    );
};

export default AppFooter;
