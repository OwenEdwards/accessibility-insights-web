// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { shallow } from 'enzyme';
import * as React from 'react';
import { It, Mock, Times } from 'typemoq';

import { ContentActionMessageCreator } from '../../../../../common/message-creators/content-action-message-creator';
import { createMarkup } from '../../../../../views/content/markup';

describe('ContentPage', () => {

    const mock = Mock.ofType<ContentActionMessageCreator>();
    const deps = { contentActionMessageCreator: mock.object };

    beforeEach(() => {
        mock.reset();
    });

    const {
        Do,
        Dont,
        Pass,
        Fail,
        PassFail,
        Columns,
        Column,
        HyperLink,
        CodeExample,
        Links,
        LandmarkLegend,
        Table,
        ProblemList,
    } = createMarkup(deps);

    describe('.Markup', () => {

        it('<LandmarkLegend> renders', () => {
            const wrapper = shallow(<LandmarkLegend role="test">TEST</LandmarkLegend>);
            expect(wrapper.debug()).toMatchSnapshot();
        });

        it('<Table> renders', () => {
            const wrapper = shallow(<Table>table contetn</Table>);
            expect(wrapper.debug()).toMatchSnapshot();
        });

        it('<ProblemList> renders', () => {
            const wrapper = shallow(<ProblemList>list contetn</ProblemList>);
            expect(wrapper.debug()).toMatchSnapshot();
        });

        it('<LandmarkLegend> renders', () => {
            const wrapper = shallow(<Do>THINGS TO DO</Do>);
            expect(wrapper.debug()).toMatchSnapshot();
        });

        it('<Do> renders', () => {
            const wrapper = shallow(<Do>THINGS TO DO</Do>);
            expect(wrapper.debug()).toMatchSnapshot();
        });

        it('<Dont> renders', () => {
            const wrapper = shallow(<Dont>DON'T DO THIS</Dont>);
            expect(wrapper.debug()).toMatchSnapshot();
        });

        it('<Pass> renders', () => {
            const wrapper = shallow(<Pass>I PASSED :)</Pass>);
            expect(wrapper.debug()).toMatchSnapshot();
        });

        it('<Fail> renders', () => {
            const wrapper = shallow(<Fail>I FAILED :(</Fail>);
            expect(wrapper.debug()).toMatchSnapshot();
        });

        it('<Columns> renders', () => {
            const wrapper = shallow(<Columns>INSIDE COLUMNS</Columns>);
            expect(wrapper.debug()).toMatchSnapshot();
        });

        it('<Column> renders', () => {
            const wrapper = shallow(<Column>INSIDE COLUMN</Column>);
            expect(wrapper.debug()).toMatchSnapshot();
        });

        describe('<PassFail>', () => {
            it('renders without example headers', () => {
                const wrapper = shallow(<PassFail
                    failText={<p>I FAILED :(</p>}
                    failExample="This is the failure [example]."
                    passText={<p>I PASSED!</p>}
                    passExample="This is the passing [example]."
                />);
                expect(wrapper.debug()).toMatchSnapshot();
            });

            it('renders with example headers', () => {
                const wrapper = shallow(<PassFail
                    failText={<p>I FAILED :(</p>}
                    failExample={<CodeExample title="How I failed">This is the failure [example].</CodeExample>}
                    passText={<p>I PASSED!</p>}
                    passExample={<CodeExample title={<>How I <b>passed</b></>}>This is the passing [example].</CodeExample>}
                />);
                expect(wrapper.debug()).toMatchSnapshot();
            });

        })

        describe('<HyperLink>', () => {
            const href = 'http://my.link';

            const wrapper = shallow(<HyperLink href={href}>LINK TEXT</HyperLink>);

            it('renders', () => {
                expect(wrapper.debug()).toMatchSnapshot();
            });

            it('registers click with event', () => {
                wrapper.simulate('click');

                mock.verify(m => m.openContentHyperLink(It.isAny(), href), Times.once());
            });
        });

        describe('<CodeExample>', () => {

            function getHighlights(wrapper): string[] {
                const code = wrapper.find('Code');
                return code.children().map(node => {
                    if (node.is('span') && node.prop('className') === 'highlight') {
                        return '[' + node.text() + ']';
                    } else {
                        return node.debug();
                    }
                });
            }

            it('renders with title', () => {
                const wrapper = shallow(<CodeExample title="title">code</CodeExample>);
                expect(wrapper.find('.code-example-title').getElement()).toEqual(
                    <div className="code-example-title">
                        <h4>title</h4>
                    </div>);
            });

            it('renders with no title', () => {
                const wrapper = shallow(<CodeExample >code</CodeExample>);
                expect(wrapper.find('.code-example-title').isEmpty()).toEqual(true);
            });

            it('renders with no highlighted region', () => {
                const wrapper = shallow(<CodeExample>No highlight</CodeExample>);
                expect(getHighlights(wrapper)).toEqual([
                    'No highlight',
                ]);
            });

            it('renders with one highlighted region', () => {
                const wrapper = shallow(<CodeExample>One [single] highlight</CodeExample>);
                expect(getHighlights(wrapper)).toEqual([
                    'One ',
                    '[single]',
                    ' highlight']);
            });

            it('renders with empty highlighted region', () => {
                const wrapper = shallow(<CodeExample>Empty [] highlight</CodeExample>);
                expect(getHighlights(wrapper)).toEqual([
                    'Empty ',
                    '[]',
                    ' highlight']);
            });

            it('renders with unterminated highlighted region', () => {
                const wrapper = shallow(<CodeExample>One [unterminated highlight</CodeExample>);
                expect(getHighlights(wrapper)).toEqual([
                    'One ',
                    '[unterminated highlight]']);
            });

            it('renders with many highlighted regions', () => {
                const wrapper = shallow(<CodeExample>With [quite] a [number] of [highlights].</CodeExample>);
                expect(getHighlights(wrapper)).toEqual([
                    'With ',
                    '[quite]',
                    ' a ',
                    '[number]',
                    ' of ',
                    '[highlights]',
                    '.']);
            });
        });

        describe('<Links>', () => {

            const link1 = <HyperLink href="about:blank">One</HyperLink>;
            const link2 = <HyperLink href="about:blank">Two</HyperLink>;
            const link3 = <HyperLink href="about:blank">Three</HyperLink>;


            it('renders with text', () => {
                const wrapper = shallow(<Links>Some text</Links>);
                expect(wrapper.debug()).toMatchSnapshot();
            });

            it('renders with one link', () => {
                const wrapper = shallow(<Links>{link1}</Links>);
                expect(wrapper.debug()).toMatchSnapshot();
            });

            it('renders with many links', () => {
                const wrapper = shallow(<Links>{link1}{link2}{link3}</Links>);
                expect(wrapper.debug()).toMatchSnapshot();
            });
        });

    });

});
