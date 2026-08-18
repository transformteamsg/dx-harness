/*
 * The pre-swap tracker kept scanning after a template interpolation. The
 * ast-grep front end must do the same even though `${...}` is not valid CSS.
 */
const Card = styled.div`
  color: ${props => props.color};
  padding: 15px;
`;
