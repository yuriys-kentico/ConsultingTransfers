import { FC } from "react";
import { RouteComponentProps } from "@reach/router";

export type RoutedFC<P = {}> = FC<RouteComponentProps<P>>;
