import { type ReactNode } from "react";
import { Button, Heading, Section } from ".";
import Sidebar from "../Sidebar";

export default function Content({
  header,
  children,
  sidebar,
  buttonNext,
  buttonBack,
  buttonNextAction,
  buttonBackAction,
  buttonNextDisabled,
}: {
  header: string;
  children: ReactNode;
  sidebar: boolean;
  buttonNext?: string;
  buttonBack?: string;
  buttonNextAction?: () => void;
  buttonBackAction?: () => void;
  buttonNextDisabled?: boolean;
}) {
  return (
    <div className="flex h-full">
      <Section className="flex-grow flex flex-col overflow-hidden">
        <Heading level={1}>{header}</Heading>
        <hr className="my-4" />
        <div className="flex-grow overflow-y-auto">{children}</div>
        <div className="flex gap-4">
          {buttonBack && (
            <Button
              fullWidth
              className="mt-4"
              onClick={buttonBackAction}
              variant="secondary"
            >
              {buttonBack}
            </Button>
          )}
          {buttonNext && (
            <Button fullWidth className="mt-4" onClick={buttonNextAction} disabled={buttonNextDisabled}>
              {buttonNext}
            </Button>
          )}
        </div>
      </Section>
      {sidebar && <Sidebar />}
    </div>
  );
}
