import { type ReactNode } from "react";
import { Button, Heading, Section } from ".";
import Sidebar from "../Sidebar";

export default function Content({
  header,
  children,
  sidebar,
  button1,
  button2,
  button1action,
  button2action,
}: {
  header: string;
  children: ReactNode;
  sidebar: boolean;
  button1?: string;
  button2?: string;
  button1action?: () => void;
  button2action?: () => void;
}) {
  return (
    <div className="flex h-full">
      <Section className="flex-grow flex flex-col overflow-hidden">
        <Heading level={1}>{header}</Heading>
        <hr className="my-4" />
        <div className="flex-grow overflow-y-auto">{children}</div>
        <div className="flex gap-4">
          {button1 && (
            <Button fullWidth className="mt-4" onClick={button1action}>
              {button1}
            </Button>
          )}
          {button2 && (
            <Button fullWidth className="mt-4" onClick={button2action}>
              {button2}
            </Button>
          )}
        </div>
      </Section>
      {sidebar && <Sidebar />}
    </div>
  );
}
