import { Redirect } from "expo-router";

export default function NotFound() {
  // Use 'as any' to avoid the type error - this is a workaround for Expo Router type issues
  const homePath = { pathname: "(tabs)" } as any;

  return <Redirect href={homePath} />;
}
