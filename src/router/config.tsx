
import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import Inscription from "../pages/inscription/page";
import Recherche from "../pages/recherche/page";
import GestionHopital from "../pages/gestion-hopital/page";
import Administration from "../pages/administration/page";
import TableauDeBordDonneur from "../pages/tableau-de-bord-donneur/page";
import ConnexionDonneur from "../pages/connexion-donneur/page";
import ConnexionHopital from "../pages/connexion-hopital/page";
import ConnexionAdministration from "../pages/connexion-administration/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/inscription",
    element: <Inscription />,
  },
  {
    path: "/connexion-donneur",
    element: <ConnexionDonneur />,
  },
  {
    path: "/connexion-hopital",
    element: <ConnexionHopital />,
  },
  {
    path: "/connexion-administration",
    element: <ConnexionAdministration />,
  },
  {
    path: "/recherche",
    element: <Recherche />,
  },
  {
    path: "/gestion-hopital",
    element: <GestionHopital />,
  },
  {
    path: "/administration",
    element: <Administration />,
  },
  {
    path: "/tableau-de-bord-donneur",
    element: <TableauDeBordDonneur />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
