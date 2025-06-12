import React from "react";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { NavigationListItem } from "@/components/ui/navigation-list-item";

const MainNav = () => {
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Services</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/20 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/consultations"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Online Consultations
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Connect with healthcare professionals from the comfort of
                      your home
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <NavigationListItem href="/tests" title="Medical Tests">
                Schedule health checks and laboratory tests
              </NavigationListItem>
              <NavigationListItem href="/pharmacy" title="Pharmacy">
                Order medications and health products
              </NavigationListItem>
              <NavigationListItem
                href="/health-packages"
                title="Health Packages"
              >
                Comprehensive healthcare plans for your needs
              </NavigationListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
              <NavigationListItem href="/health-blog" title="Health Blog">
                Expert articles on health and wellness
              </NavigationListItem>
              <NavigationListItem href="/faqs" title="FAQs">
                Common questions about our services
              </NavigationListItem>
              <NavigationListItem href="/insurance" title="Insurance">
                Information about accepted insurance plans
              </NavigationListItem>
              <NavigationListItem href="/support" title="Support">
                Get help with using our platform
              </NavigationListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/blogs" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Blogs
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export { MainNav };
